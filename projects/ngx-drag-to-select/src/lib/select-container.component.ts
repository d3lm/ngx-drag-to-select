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
  AfterViewInit,
  PLATFORM_ID,
  Inject
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

import { Observable, Subject, combineLatest, merge, from, fromEvent, BehaviorSubject, asyncScheduler } from 'rxjs';

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
  observeOn,
  startWith
} from 'rxjs/operators';

import { SelectItemDirective } from './select-item.directive';
import { ShortcutService } from './shortcut.service';

import { createSelectBox } from './operators';

import {
  Action,
  SelectBox,
  MousePosition,
  SelectContainerHost,
  UpdateAction,
  UpdateActions,
  PredicateFn
} from './models';

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
  selector: 'dts-select-container',
  exportAs: 'dts-select-container',
  host: {
    class: 'dts-select-container'
  },
  template: `
    <ng-content></ng-content>
    <div #selectBox [ngStyle]="selectBoxStyles$ | async" class="dts-select-box"></div>
  `,
  styleUrls: ['./select-container.component.scss']
})
export class SelectContainerComponent implements AfterViewInit, OnDestroy {
  host: SelectContainerHost;
  selectBoxStyles$: Observable<SelectBox<string>>;

  @ViewChild('selectBox')
  private $selectBox: ElementRef;

  @ContentChildren(SelectItemDirective, { descendants: true })
  private $selectableItems: QueryList<SelectItemDirective>;

  @Input()
  selectedItems: any;

  @Input()
  selectOnDrag = true;

  @Input()
  disabled = false;

  @Input()
  disableDrag = false;

  @Input()
  selectMode = false;

  @Input()
  selectWithShortcut = false;

  @Input()
  @HostBinding('class.dts-custom')
  custom = false;

  @Output()
  selectedItemsChange = new EventEmitter<any>();

  @Output()
  select = new EventEmitter<any>();

  @Output()
  itemSelected = new EventEmitter<any>();

  @Output()
  itemDeselected = new EventEmitter<any>();

  private _tmpItems = new Map<SelectItemDirective, Action>();

  private _selectedItems$ = new BehaviorSubject<Array<any>>([]);
  private updateItems$ = new Subject<UpdateAction>();
  private destroy$ = new Subject<void>();

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private shortcuts: ShortcutService,
    private hostElementRef: ElementRef,
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.host = this.hostElementRef.nativeElement;

      this._initSelectedItemsChange();

      this._calculateBoundingClientRect();
      this._observeBoundingRectChanges();
      this._observeSelectableItems();

      const mouseup$ = fromEvent(window, 'mouseup').pipe(
        filter(() => !this.disabled),
        tap(() => this._onMouseUp()),
        share()
      );

      const mousemove$ = fromEvent(window, 'mousemove').pipe(
        filter(() => !this.disabled),
        share()
      );

      const mousedown$ = fromEvent(this.host, 'mousedown').pipe(
        filter(() => !this.disabled),
        tap((event: MouseEvent) => this._onMouseDown(event)),
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
          filter(() => !this.selectMode),
          filter((event: MouseEvent) => this._cursorWithinHost(event)),
          filter(
            (event: MouseEvent) =>
              (!this.shortcuts.disableSelection(event) && !this.shortcuts.toggleSingleItem(event)) ||
              this.shortcuts.removeFromSelection(event)
          ),
          takeUntil(this.destroy$)
        )
        .subscribe(event => this._selectItems(event));

      selectBox$
        .pipe(
          auditTime(AUDIT_TIME),
          withLatestFrom(mousemove$, (selectBox, event: MouseEvent) => ({
            selectBox,
            event
          })),
          filter(() => this.selectOnDrag),
          filter(({ selectBox }) => selectBox.width > MIN_WIDTH || selectBox.height > MIN_HEIGHT),
          takeUntil(this.destroy$)
        )
        .subscribe(({ event }) => this._selectItems(event));

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
      this._selectItem(item);
    });
  }

  toggleItems<T>(predicate: PredicateFn<T>) {
    this._filterSelectableItems(predicate).subscribe((item: SelectItemDirective) => this._toggleItem(item));
  }

  selectItems<T>(predicate: PredicateFn<T>) {
    this._filterSelectableItems(predicate).subscribe((item: SelectItemDirective) => this._selectItem(item));
  }

  deselectItems<T>(predicate: PredicateFn<T>) {
    this._filterSelectableItems(predicate).subscribe((item: SelectItemDirective) => this._deselectItem(item));
  }

  clearSelection() {
    this.$selectableItems.forEach(item => {
      this._deselectItem(item);
    });
  }

  update() {
    this._calculateBoundingClientRect();
    this.$selectableItems.forEach(item => item.calculateBoundingClientRect());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private _filterSelectableItems<T>(predicate: PredicateFn<T>) {
    // Wrap select items in an observable for better efficiency as
    // no intermediate arrays are created and we only need to process
    // every item once.
    return from(this.$selectableItems.toArray()).pipe(filter(item => predicate(item.value)));
  }

  private _initSelectedItemsChange() {
    this._selectedItems$
      .pipe(
        auditTime(AUDIT_TIME),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: selectedItems => {
          this.selectedItemsChange.emit(selectedItems);
          this.select.emit(selectedItems);
        },
        complete: () => {
          this.selectedItemsChange.emit([]);
        }
      });
  }

  private _observeSelectableItems() {
    // Listen for updates and either select or deselect an item
    this.updateItems$
      .pipe(
        withLatestFrom(this._selectedItems$),
        takeUntil(this.destroy$)
      )
      .subscribe(([update, selectedItems]: [UpdateAction, any[]]) => {
        const item = update.item;

        switch (update.type) {
          case UpdateActions.Add:
            if (this._addItem(item, selectedItems)) {
              item._select();
            }
            break;
          case UpdateActions.Remove:
            if (this._removeItem(item, selectedItems)) {
              item._deselect();
            }
            break;
        }
      });

    // Update the container as well as all selectable items if the list has changed
    this.$selectableItems.changes
      .pipe(
        withLatestFrom(this._selectedItems$),
        observeOn(asyncScheduler),
        takeUntil(this.destroy$)
      )
      .subscribe(([items, selectedItems]: [QueryList<SelectItemDirective>, any[]]) => {
        const newList = items.toArray();
        const removedItems = selectedItems.filter(item => !newList.includes(item.value));

        if (removedItems.length) {
          removedItems.forEach(item => this._removeItem(item, selectedItems));
        }

        this.update();
      });
  }

  private _observeBoundingRectChanges() {
    this.ngZone.runOutsideAngular(() => {
      const resize$ = fromEvent(window, 'resize');
      const windowScroll$ = fromEvent(window, 'scroll');
      const containerScroll$ = fromEvent(this.host, 'scroll');

      merge(resize$, windowScroll$, containerScroll$)
        .pipe(
          startWith('INITIAL_UPDATE'),
          auditTime(AUDIT_TIME),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          this.update();
        });
    });
  }

  private _calculateBoundingClientRect() {
    this.host.boundingClientRect = calculateBoundingClientRect(this.host);
  }

  private _cursorWithinHost(event: MouseEvent) {
    return cursorWithinElement(event, this.host);
  }

  private _onMouseUp() {
    this._flushItems();
    this.renderer.removeClass(document.body, NO_SELECT_CLASS);
  }

  private _onMouseDown(event: MouseEvent) {
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
        (withinBoundingBox &&
          !this.shortcuts.toggleSingleItem(event) &&
          !this.selectMode &&
          !this.selectWithShortcut) ||
        (withinBoundingBox && this.shortcuts.toggleSingleItem(event) && !item.selected) ||
        (!withinBoundingBox && this.shortcuts.toggleSingleItem(event) && item.selected) ||
        (withinBoundingBox && !item.selected && this.selectMode) ||
        (!withinBoundingBox && item.selected && this.selectMode);

      const shouldRemove =
        (!withinBoundingBox &&
          !this.shortcuts.toggleSingleItem(event) &&
          !this.selectMode &&
          !this.selectWithShortcut) ||
        (!withinBoundingBox && this.shortcuts.toggleSingleItem(event) && !item.selected) ||
        (withinBoundingBox && this.shortcuts.toggleSingleItem(event) && item.selected) ||
        (!withinBoundingBox && !item.selected && this.selectMode) ||
        (withinBoundingBox && item.selected && this.selectMode);

      if (shouldAdd) {
        this._selectItem(item);
      } else if (shouldRemove) {
        this._deselectItem(item);
      }
    });
  }

  private _selectItems(event: MouseEvent) {
    const selectionBox = calculateBoundingClientRect(this.$selectBox.nativeElement);

    this.$selectableItems.forEach(item => {
      if (this.shortcuts.extendedSelectionShortcut(event) && this.selectOnDrag) {
        this._extendedSelectionMode(selectionBox, item, event);
      } else {
        this._normalSelectionMode(selectionBox, item, event);
      }
    });
  }

  private _normalSelectionMode(selectBox, item: SelectItemDirective, event: MouseEvent) {
    const inSelection = boxIntersects(selectBox, item.getBoundingClientRect());

    const shouldAdd = inSelection && !item.selected && !this.shortcuts.removeFromSelection(event);

    const shouldRemove =
      (!inSelection && item.selected && !this.shortcuts.addToSelection(event)) ||
      (inSelection && item.selected && this.shortcuts.removeFromSelection(event));

    if (shouldAdd) {
      this._selectItem(item);
    } else if (shouldRemove) {
      this._deselectItem(item);
    }
  }

  private _extendedSelectionMode(selectBox, item: SelectItemDirective, event: MouseEvent) {
    const inSelection = boxIntersects(selectBox, item.getBoundingClientRect());

    const shoudlAdd =
      (inSelection && !item.selected && !this.shortcuts.removeFromSelection(event) && !this._tmpItems.has(item)) ||
      (inSelection && item.selected && this.shortcuts.removeFromSelection(event) && !this._tmpItems.has(item));

    const shouldRemove =
      (!inSelection && item.selected && this.shortcuts.addToSelection(event) && this._tmpItems.has(item)) ||
      (!inSelection && !item.selected && this.shortcuts.removeFromSelection(event) && this._tmpItems.has(item));

    if (shoudlAdd) {
      item.selected ? item._deselect() : item._select();

      const action = this.shortcuts.removeFromSelection(event)
        ? Action.Delete
        : this.shortcuts.addToSelection(event)
          ? Action.Add
          : Action.None;

      this._tmpItems.set(item, action);
    } else if (shouldRemove) {
      this.shortcuts.removeFromSelection(event) ? item._select() : item._deselect();
      this._tmpItems.delete(item);
    }
  }

  private _flushItems() {
    this._tmpItems.forEach((action, item) => {
      if (action === Action.Add) {
        this._selectItem(item);
      }

      if (action === Action.Delete) {
        this._deselectItem(item);
      }
    });

    this._tmpItems.clear();
  }

  private _addItem(item: SelectItemDirective, selectedItems: Array<any>) {
    let success = false;

    if (!this._hasItem(item, selectedItems)) {
      success = true;
      selectedItems.push(item.value);
      this._selectedItems$.next(selectedItems);
      this.itemSelected.emit(item.value);
    }

    return success;
  }

  private _removeItem(item: SelectItemDirective, selectedItems: Array<any>) {
    let success = false;
    const value = item instanceof SelectItemDirective ? item.value : item;
    const index = selectedItems.indexOf(value);

    if (index > -1) {
      success = true;
      selectedItems.splice(index, 1);
      this._selectedItems$.next(selectedItems);
      this.itemDeselected.emit(item.value);
    }

    return success;
  }

  private _toggleItem(item: SelectItemDirective) {
    if (item.selected) {
      this._deselectItem(item);
    } else {
      this._selectItem(item);
    }
  }

  private _selectItem(item: SelectItemDirective) {
    this.updateItems$.next({ type: UpdateActions.Add, item });
  }

  private _deselectItem(item: SelectItemDirective) {
    this.updateItems$.next({ type: UpdateActions.Remove, item });
  }

  private _hasItem(item: SelectItemDirective, selectedItems: Array<any>) {
    return selectedItems.includes(item.value);
  }
}
