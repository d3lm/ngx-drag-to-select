import {
  Component,
  ElementRef,
  ViewChild,
  ContentChildren,
  Output,
  EventEmitter,
  Input,
  OnDestroy,
  Renderer2,
  QueryList,
  OnInit
} from '@angular/core';

import { Platform } from '@angular/cdk/platform';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { merge } from 'rxjs/observable/merge';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { asap } from 'rxjs/scheduler/asap';

import {
  switchMap,
  takeUntil,
  map,
  tap,
  filter,
  auditTime,
  mapTo,
  share,
  withLatestFrom,
  distinctUntilChanged
} from 'rxjs/operators';

import { SelectItemDirective } from './select-item.directive';
import { ShortcutService } from './shortcut.service';
import { createSelectBox, observableProxy } from './operators';
import { Action, SelectBox, SelectBoxInput, MousePosition } from './models';
import { AUDIT_TIME, NO_SELECT_CLASS, MIN_WIDTH, MIN_HEIGHT } from './constants';
import { inBoundingBox, cursorWithinElement, clearSelection, getCurrentMousePosition, boxIntersects } from './utils';

@Component({
  selector: 'ngx-select-container',
  exportAs: 'ngx-select-container',
  host: {
    class: 'ngx-select-container'
  },
  template: `
    <ng-content></ng-content>
    <div #selectBox [ngStyle]="selectBoxStyles$ | async" class="ngx-select-box"></div>
  `,
  styleUrls: ['./select-container.component.scss']
})
export class SelectContainerComponent implements OnInit, OnDestroy {
  @ViewChild('selectBox') private $selectBox: ElementRef;

  @ContentChildren(SelectItemDirective, { descendants: true })
  private $selectItems: QueryList<SelectItemDirective>;

  @Input() selectedItems: any;
  @Input() selectOnDrag = true;
  @Input() disabled = false;

  @Output() selectedItemsChange = new EventEmitter<any>();
  @Output() select = new EventEmitter<any>();

  selectBoxStyles$: Observable<SelectBox<string>>;

  private _tmpItems = new Map<SelectItemDirective, Action>();
  private _selectedItems: Array<any>;
  private destroy$ = new Subject<void>();

  constructor(
    private shortcuts: ShortcutService,
    private platform: Platform,
    private host: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    if (this.platform.isBrowser) {
      const container = this.host.nativeElement;

      this.initProxy();

      const mouseup$ = fromEvent(window, 'mouseup').pipe(
        filter(() => !this.disabled),
        tap(() => this.onMouseUp()),
        share()
      );

      const mousemove$ = fromEvent(window, 'mousemove').pipe(filter(() => !this.disabled), share());

      const mousedown$ = fromEvent(container, 'mousedown').pipe(
        filter(() => !this.disabled),
        tap((event: MouseEvent) => this.onMouseDown(event)),
        share()
      );

      const dragging$ = mousedown$.pipe(switchMap(() => mousemove$.pipe(takeUntil(mouseup$))), share());

      const currentMousePosition$: Observable<MousePosition> = mousedown$.pipe(
        map((event: MouseEvent) => getCurrentMousePosition(event))
      );

      const show$ = dragging$.pipe(mapTo(1));
      const hide$ = mouseup$.pipe(mapTo(0));
      const opacity$ = merge(show$, hide$, asap).pipe(distinctUntilChanged());

      const selectBox$ = combineLatest(dragging$, opacity$, currentMousePosition$).pipe(
        filter(([event]: SelectBoxInput) => !this.shortcuts.disableSelection(event)),
        createSelectBox(),
        share()
      );

      mouseup$
        .pipe(
          filter((event: MouseEvent) => this.cursorWithinHost(event)),
          filter(() => !this.selectOnDrag),
          filter(
            (event: MouseEvent) =>
              (!this.shortcuts.disableSelection(event) && !this.shortcuts.toggleSingleItem(event)) ||
              this.shortcuts.removeFromSelection(event)
          ),
          withLatestFrom(selectBox$, (event, selectBox) => ({
            selectBox,
            event
          })),
          tap(({ selectBox, event }) => this.selectItems(selectBox, event)),
          takeUntil(this.destroy$)
        )
        .subscribe();

      selectBox$
        .pipe(
          auditTime(AUDIT_TIME),
          withLatestFrom(mousemove$, (selectBox, event: MouseEvent) => ({
            selectBox,
            event
          })),
          filter(() => this.selectOnDrag),
          filter(({ selectBox }) => selectBox.width > MIN_WIDTH || selectBox.height > MIN_HEIGHT),
          tap(({ selectBox, event }) => this.selectItems(selectBox, event)),
          takeUntil(this.destroy$)
        )
        .subscribe();

      this.selectBoxStyles$ = selectBox$.pipe(
        map(selectBox => ({
          top: `${selectBox.top}px`,
          left: `${selectBox.left}px`,
          width: `${selectBox.width}px`,
          height: `${selectBox.height}px`,
          opacity: selectBox.opacity
        }))
      );
    }
  }

  selectAll() {
    this.$selectItems.forEach(item => {
      if (!this.hasItem(item)) {
        this.addItem(item);
      }
    });
  }

  clearSelection() {
    this.$selectItems.forEach(item => {
      this.removeItem(item);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initProxy() {
    const { proxy, proxy$ } = observableProxy([]);

    this._selectedItems = proxy;

    proxy$
      .pipe(auditTime(AUDIT_TIME), map(_ => this._selectedItems), takeUntil(this.destroy$))
      .subscribe(selectedItems => {
        this.select.emit(selectedItems);
        this.selectedItemsChange.emit(selectedItems);
      });
  }

  private cursorWithinHost(event: MouseEvent) {
    return cursorWithinElement(event, this.host.nativeElement);
  }

  private onMouseUp() {
    this.flushItems();
    this.renderer.removeClass(document.body, NO_SELECT_CLASS);
  }

  private onMouseDown(event: MouseEvent) {
    if (this.shortcuts.disableSelection(event)) {
      return;
    }

    clearSelection(window);
    this.renderer.addClass(document.body, NO_SELECT_CLASS);

    const mousePoint = getCurrentMousePosition(event);

    this.$selectItems.forEach((item, index) => {
      const itemRect = item.getBoundingClientRect();
      const withinBoundingBox = inBoundingBox(mousePoint, itemRect);

      if (this.shortcuts.extendedSelectionShortcut(event)) {
        return;
      }

      const shouldAdd =
        (withinBoundingBox && !this.shortcuts.toggleSingleItem(event)) ||
        (withinBoundingBox && this.shortcuts.toggleSingleItem(event) && !item.selected) ||
        (!withinBoundingBox && this.shortcuts.toggleSingleItem(event) && item.selected);

      const shouldRemove =
        (!withinBoundingBox && !this.shortcuts.toggleSingleItem(event)) ||
        (!withinBoundingBox && this.shortcuts.toggleSingleItem(event) && !item.selected) ||
        (withinBoundingBox && this.shortcuts.toggleSingleItem(event) && item.selected);

      if (shouldAdd) {
        this.addItem(item);
      } else if (shouldRemove) {
        this.removeItem(item);
      }
    });
  }

  private selectItems(selectBox, event: MouseEvent) {
    this.$selectItems.forEach((item, index) => {
      if (this.shortcuts.extendedSelectionShortcut(event) && this.selectOnDrag) {
        this.extendedSelectionMode(selectBox, item, event);
      } else {
        this.normalSelectionMode(selectBox, item, event);
      }
    });
  }

  private normalSelectionMode(selectBox, item: SelectItemDirective, event: MouseEvent) {
    const inSelection = boxIntersects(selectBox, item.getBoundingClientRect());

    const shouldAdd = inSelection && !item.selected && !this.shortcuts.removeFromSelection(event);

    const shouldRemove =
      (!inSelection && item.selected && !this.shortcuts.addToSelection(event)) ||
      (inSelection && item.selected && this.shortcuts.removeFromSelection(event));

    if (shouldAdd) {
      this.addItem(item);
    } else if (shouldRemove) {
      this.removeItem(item);
    }
  }

  private extendedSelectionMode(selectBox, item: SelectItemDirective, event: MouseEvent) {
    const inSelection = boxIntersects(selectBox, item.getBoundingClientRect());

    const shoudlAdd =
      (inSelection && !item.selected && !this.shortcuts.removeFromSelection(event) && !this._tmpItems.has(item)) ||
      (inSelection && item.selected && this.shortcuts.removeFromSelection(event) && !this._tmpItems.has(item));

    const shouldRemove =
      (!inSelection && item.selected && this.shortcuts.addToSelection(event) && this._tmpItems.has(item)) ||
      (!inSelection && !item.selected && this.shortcuts.removeFromSelection(event) && this._tmpItems.has(item));

    if (shoudlAdd) {
      item.selected ? item.deselect() : item.select();

      const action = this.shortcuts.removeFromSelection(event)
        ? Action.Delete
        : this.shortcuts.addToSelection(event) ? Action.Add : Action.None;

      this._tmpItems.set(item, action);
    } else if (shouldRemove) {
      this.shortcuts.removeFromSelection(event) ? item.select() : item.deselect();
      this._tmpItems.delete(item);
    }
  }

  private flushItems() {
    this._tmpItems.forEach((action, item) => {
      if (action === Action.Add) {
        this.addItem(item);
      }

      if (action === Action.Delete) {
        this.removeItem(item);
      }
    });

    this._tmpItems.clear();
  }

  private addItem(item: SelectItemDirective) {
    if (!this.hasItem(item)) {
      item.select();
      this._selectedItems.push(item.value);
    }
  }

  private removeItem(item: SelectItemDirective) {
    const index = this._selectedItems.indexOf(item.value);

    if (index > -1) {
      item.deselect();
      this._selectedItems.splice(index, 1);
    }
  }

  private hasItem(item: SelectItemDirective) {
    return this._selectedItems.includes(item.value);
  }
}
