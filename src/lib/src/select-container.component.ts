import {
  Component,
  ElementRef,
  Output,
  EventEmitter,
  Input,
  OnDestroy,
  Renderer2,
  ViewChild,
  NgZone,
  ContentChildren,
  QueryList,
  HostBinding,
  AfterViewInit
} from '@angular/core';

import { Platform } from '@angular/cdk/platform';

import { Observable, Subject, combineLatest, merge, fromEvent } from 'rxjs';

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
  distinctUntilChanged,
  startWith
} from 'rxjs/operators';

import { SelectItemDirective } from './select-item.directive';
import { ShortcutService } from './shortcut.service';

import { createSelectBox, observableProxy } from './operators';
import { Action, SelectBox, MousePosition, SelectContainerHost } from './models';
import { AUDIT_TIME, NO_SELECT_CLASS, MIN_WIDTH, MIN_HEIGHT } from './constants';

import {
  inBoundingBox,
  cursorWithinElement,
  clearSelection,
  boxIntersects,
  calculateBoundingClientRect,
  getRelativeMousePosition,
  getMousePosition
} from './utils';

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
export class SelectContainerComponent implements AfterViewInit, OnDestroy {
  host: SelectContainerHost;
  selectBoxStyles$: Observable<SelectBox<string>>;

  @ViewChild('selectBox') private $selectBox: ElementRef;

  @ContentChildren(SelectItemDirective, { descendants: true })
  private $selectableItems: QueryList<SelectItemDirective>;

  @Input() selectedItems: any;
  @Input() selectOnDrag = true;
  @Input() disabled = false;
  @Input() disableDrag = false;
  @Input() selectMode = false;

  @Input()
  @HostBinding('class.ngx-custom')
  custom = false;

  @Output() selectedItemsChange = new EventEmitter<any>();
  @Output() select = new EventEmitter<any>();

  private _tmpItems = new Map<SelectItemDirective, Action>();
  private _selectedItems: Array<any>;
  private destroy$ = new Subject<void>();

  constructor(
    private shortcuts: ShortcutService,
    private platform: Platform,
    private hostElementRef: ElementRef,
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit() {
    if (this.platform.isBrowser) {
      this.host = this.hostElementRef.nativeElement;

      this.initProxy();

      this.observeBoundingRectChanges();
      this.observeSelectableItems();

      const mouseup$ = fromEvent(window, 'mouseup').pipe(
        filter(() => !this.disabled),
        tap(() => this.onMouseUp()),
        share()
      );

      const mousemove$ = fromEvent(window, 'mousemove').pipe(filter(() => !this.disabled), share());

      const mousedown$ = fromEvent(this.host, 'mousedown').pipe(
        filter(() => !this.disabled),
        tap((event: MouseEvent) => this.onMouseDown(event)),
        share()
      );

      const dragging$ = mousedown$.pipe(
        filter(event => !this.shortcuts.disableSelection(event)),
        filter(event => !this.selectMode),
        filter(event => !this.disableDrag),
        switchMap(() => mousemove$.pipe(takeUntil(mouseup$))),
        share()
      );

      const currentMousePosition$: Observable<MousePosition> = mousedown$.pipe(
        map((event: MouseEvent) => getRelativeMousePosition(event, this.host))
      );

      const show$ = dragging$.pipe(mapTo(1));
      const hide$ = mouseup$.pipe(mapTo(0));
      const opacity$ = merge(show$, hide$).pipe(distinctUntilChanged());

      const selectBox$ = combineLatest(dragging$, opacity$, currentMousePosition$).pipe(
        createSelectBox(this.host),
        share()
      );

      mouseup$
        .pipe(
          filter(() => !this.selectOnDrag),
          filter((event: MouseEvent) => this.cursorWithinHost(event)),
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
    this.$selectableItems.forEach(item => {
      this.selectItem(item);
    });
  }

  clearSelection() {
    this.$selectableItems.forEach(item => {
      this.deselectItem(item);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initProxy() {
    const { proxy, proxy$ } = observableProxy([]);

    this._selectedItems = proxy;

    proxy$.pipe(auditTime(AUDIT_TIME), map(_ => this._selectedItems), takeUntil(this.destroy$)).subscribe({
      next: selectedItems => {
        this.selectedItemsChange.emit(selectedItems);
        this.select.emit(selectedItems);
      },
      complete: () => {
        this.selectedItemsChange.emit([]);
      }
    });
  }

  private observeSelectableItems() {
    // Update the container as well as all selectable items if the list has changed
    this.$selectableItems.changes.pipe(takeUntil(this.destroy$)).subscribe((items: QueryList<SelectItemDirective>) => {
      const newList = items.toArray();
      const removedItems = this._selectedItems.filter(item => !newList.includes(item.value));

      setTimeout(() => {
        if (removedItems.length) {
          removedItems.forEach(item => this.removeItem(item));
        }
        this.update();
      });
    });
  }

  private observeBoundingRectChanges() {
    // Initialize client bounding rect
    setTimeout(() => this.calculateBoundingClientRect());

    this.ngZone.runOutsideAngular(() => {
      const resize$ = fromEvent(window, 'resize');
      const windowScroll$ = fromEvent(window, 'scroll');
      const containerScroll$ = fromEvent(this.host, 'scroll');

      merge(resize$, windowScroll$, containerScroll$)
        .pipe(auditTime(AUDIT_TIME), takeUntil(this.destroy$))
        .subscribe(() => {
          this.update();
        });
    });
  }

  private update() {
    this.calculateBoundingClientRect();
    this.$selectableItems.forEach(item => item.calculateBoundingClientRect());
  }

  private calculateBoundingClientRect() {
    this.host.boundingClientRect = calculateBoundingClientRect(this.host);
  }

  private cursorWithinHost(event: MouseEvent) {
    return cursorWithinElement(event, this.host);
  }

  private onMouseUp() {
    this.flushItems();
    this.renderer.removeClass(document.body, NO_SELECT_CLASS);
  }

  private onMouseDown(event: MouseEvent) {
    if (this.shortcuts.disableSelection(event) || this.disabled) {
      return;
    }

    clearSelection(window);

    if (!this.disableDrag) {
      this.renderer.addClass(document.body, NO_SELECT_CLASS);
    }

    const mousePoint = getMousePosition(event);

    this.$selectableItems.forEach((item, index) => {
      const itemRect = item.getBoundingClientRect();
      const withinBoundingBox = inBoundingBox(mousePoint, itemRect);

      if (this.shortcuts.extendedSelectionShortcut(event)) {
        return;
      }

      const shouldAdd =
        (withinBoundingBox && !this.shortcuts.toggleSingleItem(event) && !this.selectMode) ||
        (withinBoundingBox && this.shortcuts.toggleSingleItem(event) && !item.selected) ||
        (!withinBoundingBox && this.shortcuts.toggleSingleItem(event) && item.selected) ||
        (withinBoundingBox && !item.selected && this.selectMode) ||
        (!withinBoundingBox && item.selected && this.selectMode);

      const shouldRemove =
        (!withinBoundingBox && !this.shortcuts.toggleSingleItem(event) && !this.selectMode) ||
        (!withinBoundingBox && this.shortcuts.toggleSingleItem(event) && !item.selected) ||
        (withinBoundingBox && this.shortcuts.toggleSingleItem(event) && item.selected) ||
        (!withinBoundingBox && !item.selected && this.selectMode) ||
        (withinBoundingBox && item.selected && this.selectMode);

      if (shouldAdd) {
        this.selectItem(item);
      } else if (shouldRemove) {
        this.deselectItem(item);
      }
    });
  }

  private selectItems(selectBox: SelectBox<number>, event: MouseEvent) {
    const selectionBox = calculateBoundingClientRect(this.$selectBox.nativeElement);

    this.$selectableItems.forEach((item, index) => {
      if (this.shortcuts.extendedSelectionShortcut(event) && this.selectOnDrag) {
        this.extendedSelectionMode(selectionBox, item, event);
      } else {
        this.normalSelectionMode(selectionBox, item, event);
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
      this.selectItem(item);
    } else if (shouldRemove) {
      this.deselectItem(item);
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
        : this.shortcuts.addToSelection(event)
          ? Action.Add
          : Action.None;

      this._tmpItems.set(item, action);
    } else if (shouldRemove) {
      this.shortcuts.removeFromSelection(event) ? item.select() : item.deselect();
      this._tmpItems.delete(item);
    }
  }

  private flushItems() {
    this._tmpItems.forEach((action, item) => {
      if (action === Action.Add) {
        this.selectItem(item);
      }

      if (action === Action.Delete) {
        this.deselectItem(item);
      }
    });

    this._tmpItems.clear();
  }

  private addItem(item: SelectItemDirective) {
    let success = false;

    if (!this.hasItem(item)) {
      success = true;
      this._selectedItems.push(item.value);
    }

    return success;
  }

  private removeItem(item: SelectItemDirective | any) {
    let success = false;
    const value = item instanceof SelectItemDirective ? item.value : item;
    const index = this._selectedItems.indexOf(value);

    if (index > -1) {
      success = true;
      this._selectedItems.splice(index, 1);
    }

    return success;
  }

  private selectItem(item: SelectItemDirective) {
    if (this.addItem(item)) {
      item.select();
    }
  }

  private deselectItem(item: SelectItemDirective) {
    if (this.removeItem(item)) {
      item.deselect();
    }
  }

  private hasItem(item: SelectItemDirective) {
    return this._selectedItems.includes(item.value);
  }
}
