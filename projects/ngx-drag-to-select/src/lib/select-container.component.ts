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
  HostBinding,
  AfterViewInit,
  PLATFORM_ID,
  Inject,
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
  startWith,
  concatMapTo,
  first,
} from 'rxjs/operators';

import { SelectItemDirective, SELECT_ITEM_INSTANCE } from './select-item.directive';
import { ShortcutService } from './shortcut.service';

import { createSelectBox, whenSelectBoxVisible } from './operators';

import {
  Action,
  SelectBox,
  MousePosition,
  SelectContainerHost,
  UpdateAction,
  UpdateActions,
  PredicateFn,
  BoundingBox,
  SelectContainer,
} from './models';

import { AUDIT_TIME, NO_SELECT_CLASS } from './constants';

import {
  inBoundingBox,
  cursorWithinElement,
  clearSelection,
  boxIntersects,
  calculateBoundingClientRect,
  getRelativeMousePosition,
  getMousePosition,
  hasMinimumSize,
} from './utils';
import { KeyboardEventsService } from './keyboard-events.service';
import { DTS_SELECT_CONTAINER } from './tokens';

@Component({
  selector: 'dts-select-container',
  exportAs: 'dts-select-container',
  template: `
    <ng-content></ng-content>
    <div
      class="dts-select-box"
      #selectBox
      [ngClass]="selectBoxClasses$ | async"
      [ngStyle]="selectBoxStyles$ | async"
    ></div>
  `,
  styleUrls: ['./select-container.component.scss'],
  providers: [{ provide: DTS_SELECT_CONTAINER, useExisting: SelectContainerComponent }],
})
export class SelectContainerComponent implements AfterViewInit, OnDestroy, SelectContainer<SelectItemDirective> {
  host: SelectContainerHost;
  selectBoxStyles$: Observable<SelectBox<string>>;
  selectBoxClasses$: Observable<{ [key: string]: boolean }>;

  @ViewChild('selectBox', { static: true })
  private $selectBox: ElementRef;

  @Input() selectedItems: any;
  @Input() selectOnDrag = true;
  @Input() disabled = false;
  @Input() disableDrag = false;
  @Input() selectOnClick = true;
  @Input() dragOverItems = true;
  @Input() disableRangeSelection = false;
  @Input() selectMode = false;
  @Input() selectWithShortcut = false;

  @Input()
  @HostBinding('class.dts-custom')
  custom = false;

  @HostBinding('class.dts-select-container')
  readonly hostClass = true;

  @Output()
  selectedItemsChange = new EventEmitter<any>();
  @Output() select = new EventEmitter<any>();
  @Output() itemSelected = new EventEmitter<any>();
  @Output() itemDeselected = new EventEmitter<any>();
  @Output() selectionStarted = new EventEmitter<void>();
  @Output() selectionEnded = new EventEmitter<Array<any>>();

  private _tmpItems = new Map<SelectItemDirective, Action>();

  private _selectedItems$ = new BehaviorSubject<Array<any>>([]);
  private _selectableItems: Array<SelectItemDirective> = [];
  private _selectableItemsNative: Array<HTMLElement> = [];
  private updateItems$ = new Subject<UpdateAction>();
  private destroy$ = new Subject<void>();

  private _lastRange: [number, number] = [-1, -1];
  private _lastStartIndex: number | undefined = undefined;
  private _newRangeStart = false;
  private _lastRangeSelection: Map<SelectItemDirective, boolean> = new Map();

  private _registry: Set<SelectItemDirective> = new Set();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Record<string, unknown>,
    private shortcuts: ShortcutService,
    private keyboardEvents: KeyboardEventsService,
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

      const mouseup$ = this.keyboardEvents.mouseup$.pipe(
        filter(() => !this.disabled),
        tap(() => this._onMouseUp()),
        share()
      );

      const mousemove$ = this.keyboardEvents.mousemove$.pipe(
        filter(() => !this.disabled),
        share()
      );

      const mousedown$ = fromEvent<MouseEvent>(this.host, 'mousedown').pipe(
        filter((event) => event.button === 0), // only emit left mouse
        filter(() => !this.disabled),
        filter((event) => this.selectOnClick || this._isClickOutsideSelectableItem(event.target)),
        tap((event) => this._onMouseDown(event)),
        share()
      );

      const dragging$ = mousedown$.pipe(
        filter((event) => !this.shortcuts.disableSelection(event)),
        filter(() => !this.selectMode),
        filter(() => !this.disableDrag),
        filter((event) => this.dragOverItems || this._isClickOutsideSelectableItem(event.target)),
        switchMap(() => mousemove$.pipe(takeUntil(mouseup$))),
        share()
      );

      const currentMousePosition$: Observable<MousePosition> = mousedown$.pipe(
        map((event: MouseEvent) => getRelativeMousePosition(event, this.host))
      );

      const show$ = dragging$.pipe(mapTo(1));
      const hide$ = mouseup$.pipe(mapTo(0));
      const opacity$ = merge(show$, hide$).pipe(distinctUntilChanged());

      const selectBox$ = combineLatest([dragging$, opacity$, currentMousePosition$]).pipe(
        createSelectBox(this.host),
        share()
      );

      this.selectBoxClasses$ = merge(
        dragging$,
        mouseup$,
        this.keyboardEvents.distinctKeydown$,
        this.keyboardEvents.distinctKeyup$
      ).pipe(
        auditTime(AUDIT_TIME),
        withLatestFrom(selectBox$),
        map(([event, selectBox]) => {
          return {
            'dts-adding': hasMinimumSize(selectBox, 0, 0) && !this.shortcuts.removeFromSelection(event),
            'dts-removing': this.shortcuts.removeFromSelection(event),
          };
        }),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      );

      const selectOnMouseUp$ = dragging$.pipe(
        filter(() => !this.selectOnDrag),
        filter(() => !this.selectMode),
        filter((event) => this._cursorWithinHost(event)),
        switchMap((_) => mouseup$.pipe(first())),
        filter(
          (event) =>
            (!this.shortcuts.disableSelection(event) && !this.shortcuts.toggleSingleItem(event)) ||
            this.shortcuts.removeFromSelection(event)
        )
      );

      const selectOnDrag$ = selectBox$.pipe(
        auditTime(AUDIT_TIME),
        withLatestFrom(mousemove$, (selectBox, event: MouseEvent) => ({
          selectBox,
          event,
        })),
        filter(() => this.selectOnDrag),
        filter(({ selectBox }) => hasMinimumSize(selectBox)),
        map(({ event }) => event)
      );

      const selectOnKeyboardEvent$ = merge(
        this.keyboardEvents.distinctKeydown$,
        this.keyboardEvents.distinctKeyup$
      ).pipe(
        auditTime(AUDIT_TIME),
        whenSelectBoxVisible(selectBox$),
        tap((event) => {
          if (this._isExtendedSelection(event)) {
            this._tmpItems.clear();
          } else {
            this._flushItems();
          }
        })
      );

      merge(selectOnMouseUp$, selectOnDrag$, selectOnKeyboardEvent$)
        .pipe(takeUntil(this.destroy$))
        .subscribe((event) => this._selectItems(event));

      this.selectBoxStyles$ = selectBox$.pipe(
        map((selectBox) => ({
          top: `${selectBox.top}px`,
          left: `${selectBox.left}px`,
          width: `${selectBox.width}px`,
          height: `${selectBox.height}px`,
          opacity: selectBox.opacity,
        }))
      );

      this._initSelectionOutputs(mousedown$, mouseup$);
    }
  }

  updateSelectableItems() {
    this._selectableItems = Array.from(this._registry);
    this._selectableItemsNative = this._selectableItems.map((directive) => directive.nativeElememnt);
  }

  selectAll() {
    this._selectableItems.forEach((item) => {
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
    this._selectableItems.forEach((item) => {
      this._deselectItem(item);
    });
  }

  register(item: SelectItemDirective) {
    this._registry.add(item);
    this.updateSelectableItems();
  }
  unregister(item: SelectItemDirective) {
    this._registry.delete(item);
    this.updateSelectableItems();
    this._removeItem(item, this.selectedItems);
  }

  update() {
    this._calculateBoundingClientRect();
    this._selectableItems.forEach((item) => item.calculateBoundingClientRect());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private _filterSelectableItems<T>(predicate: PredicateFn<T>) {
    // Wrap select items in an observable for better efficiency as
    // no intermediate arrays are created and we only need to process
    // every item once.
    return from(this._selectableItems).pipe(filter((item) => predicate(item.value)));
  }

  private _initSelectedItemsChange() {
    this._selectedItems$.pipe(auditTime(AUDIT_TIME), takeUntil(this.destroy$)).subscribe({
      next: (selectedItems) => {
        this.selectedItemsChange.emit(selectedItems);
        this.select.emit(selectedItems);
      },
      complete: () => {
        this.selectedItemsChange.emit([]);
      },
    });
  }

  private _observeSelectableItems() {
    // Listen for updates and either select or deselect an item
    this.updateItems$
      .pipe(
        withLatestFrom(this._selectedItems$),
        takeUntil(this.destroy$),
        filter(([update]) => !update.item.dtsDisabled)
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
  }

  private _observeBoundingRectChanges() {
    this.ngZone.runOutsideAngular(() => {
      const resize$ = fromEvent(window, 'resize');
      const windowScroll$ = fromEvent(window, 'scroll');
      const containerScroll$ = fromEvent(this.host, 'scroll');

      merge(resize$, windowScroll$, containerScroll$)
        .pipe(startWith('INITIAL_UPDATE'), auditTime(AUDIT_TIME), takeUntil(this.destroy$))
        .subscribe(() => {
          this.update();
        });
    });
  }

  private _initSelectionOutputs(mousedown$: Observable<MouseEvent>, mouseup$: Observable<MouseEvent>) {
    mousedown$
      .pipe(
        filter((event) => this._cursorWithinHost(event)),
        tap(() => this.selectionStarted.emit()),
        concatMapTo(mouseup$.pipe(first())),
        withLatestFrom(this._selectedItems$),
        map(([, items]) => items),
        takeUntil(this.destroy$)
      )
      .subscribe((items) => {
        this.selectionEnded.emit(items);
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
    console.log('Mouse Down');
    if (this.shortcuts.disableSelection(event) || this.disabled) {
      return;
    }

    clearSelection(window);

    if (!this.disableDrag) {
      this.renderer.addClass(document.body, NO_SELECT_CLASS);
    }

    if (this.shortcuts.removeFromSelection(event)) {
      return;
    }

    const mousePoint = getMousePosition(event);
    const [currentIndex, clickedItem] = this._getClosestSelectItem(event);

    let [startIndex, endIndex] = this._lastRange;

    const isMoveRangeStart = this.shortcuts.moveRangeStart(event);

    const shouldResetRangeSelection =
      !this.shortcuts.extendedSelectionShortcut(event) || isMoveRangeStart || this.disableRangeSelection;

    if (shouldResetRangeSelection) {
      this._resetRangeStart();
    }

    // move range start
    if (shouldResetRangeSelection && !this.disableRangeSelection) {
      if (currentIndex > -1) {
        this._newRangeStart = true;
        this._lastStartIndex = currentIndex;
        clickedItem.toggleRangeStart();

        this._lastRangeSelection.clear();
      } else {
        this._lastStartIndex = -1;
      }
    }

    if (currentIndex > -1) {
      startIndex = Math.min(this._lastStartIndex, currentIndex);
      endIndex = Math.max(this._lastStartIndex, currentIndex);
      this._lastRange = [startIndex, endIndex];
    }

    if (isMoveRangeStart) {
      return;
    }

    this._selectableItems.forEach((item, index) => {
      const itemRect = item.getBoundingClientRect();
      const withinBoundingBox = inBoundingBox(mousePoint, itemRect);

      if (this.shortcuts.extendedSelectionShortcut(event) && this.disableRangeSelection) {
        return;
      }

      const withinRange =
        this.shortcuts.extendedSelectionShortcut(event) &&
        startIndex > -1 &&
        endIndex > -1 &&
        index >= startIndex &&
        index <= endIndex &&
        startIndex !== endIndex;

      const shouldAdd =
        (withinBoundingBox &&
          !this.shortcuts.toggleSingleItem(event) &&
          !this.selectMode &&
          !this.selectWithShortcut) ||
        (this.shortcuts.extendedSelectionShortcut(event) && item.selected && !this._lastRangeSelection.get(item)) ||
        withinRange ||
        (withinBoundingBox && this.shortcuts.toggleSingleItem(event) && !item.selected) ||
        (!withinBoundingBox && this.shortcuts.toggleSingleItem(event) && item.selected) ||
        (withinBoundingBox && !item.selected && this.selectMode) ||
        (!withinBoundingBox && item.selected && this.selectMode);

      const shouldRemove =
        (!withinBoundingBox &&
          !this.shortcuts.toggleSingleItem(event) &&
          !this.selectMode &&
          !this.shortcuts.extendedSelectionShortcut(event) &&
          !this.selectWithShortcut) ||
        (this.shortcuts.extendedSelectionShortcut(event) && currentIndex > -1) ||
        (!withinBoundingBox && this.shortcuts.toggleSingleItem(event) && !item.selected) ||
        (withinBoundingBox && this.shortcuts.toggleSingleItem(event) && item.selected) ||
        (!withinBoundingBox && !item.selected && this.selectMode) ||
        (withinBoundingBox && item.selected && this.selectMode);

      if (shouldAdd) {
        this._selectItem(item);
      } else if (shouldRemove) {
        this._deselectItem(item);
      }

      if (withinRange && !this._lastRangeSelection.get(item)) {
        this._lastRangeSelection.set(item, true);
      } else if (!withinRange && !this._newRangeStart && !item.selected) {
        this._lastRangeSelection.delete(item);
      }
    });

    // if we don't toggle a single item, we set `newRangeStart` to `false`
    // meaning that we are building up a range
    if (!this.shortcuts.toggleSingleItem(event)) {
      this._newRangeStart = false;
    }
  }

  private _selectItems(event: Event) {
    const selectionBox = calculateBoundingClientRect(this.$selectBox.nativeElement);

    this._selectableItems.forEach((item, index) => {
      if (this._isExtendedSelection(event)) {
        this._extendedSelectionMode(selectionBox, item, event);
      } else {
        this._normalSelectionMode(selectionBox, item, event);

        if (this._lastStartIndex < 0 && item.selected) {
          item.toggleRangeStart();
          this._lastStartIndex = index;
        }
      }
    });
  }

  private _isExtendedSelection(event: Event) {
    return this.shortcuts.extendedSelectionShortcut(event) && this.selectOnDrag;
  }

  private _normalSelectionMode(selectBox: BoundingBox, item: SelectItemDirective, event: Event) {
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

  private _extendedSelectionMode(selectBox, item: SelectItemDirective, event: Event) {
    const inSelection = boxIntersects(selectBox, item.getBoundingClientRect());

    const shoudlAdd =
      (inSelection && !item.selected && !this.shortcuts.removeFromSelection(event) && !this._tmpItems.has(item)) ||
      (inSelection && item.selected && this.shortcuts.removeFromSelection(event) && !this._tmpItems.has(item));

    const shouldRemove =
      (!inSelection && item.selected && this.shortcuts.addToSelection(event) && this._tmpItems.has(item)) ||
      (!inSelection && !item.selected && this.shortcuts.removeFromSelection(event) && this._tmpItems.has(item));

    if (shoudlAdd) {
      if (item.selected) {
        item._deselect();
      } else {
        item._select();
      }

      const action = this.shortcuts.removeFromSelection(event)
        ? Action.Delete
        : this.shortcuts.addToSelection(event)
        ? Action.Add
        : Action.None;

      this._tmpItems.set(item, action);
    } else if (shouldRemove) {
      if (this.shortcuts.removeFromSelection(event)) {
        item._select();
      } else {
        item._deselect();
      }

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
      this.itemDeselected.emit(value);
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

  private _getClosestSelectItem(event: Event): [number, SelectItemDirective] {
    const target = (event.target as HTMLElement).closest('.dts-select-item');
    let index = -1;
    let targetItem = null;

    if (target) {
      targetItem = target[SELECT_ITEM_INSTANCE];
      index = this._selectableItems.indexOf(targetItem);
    }

    return [index, targetItem];
  }

  private _resetRangeStart() {
    this._lastRange = [-1, -1];
    const lastRangeStart = this._getLastRangeSelection();

    if (lastRangeStart && lastRangeStart.rangeStart) {
      lastRangeStart.toggleRangeStart();
    }
  }

  private _getLastRangeSelection(): SelectItemDirective | null {
    if (this._lastStartIndex >= 0) {
      return this._selectableItems[this._lastStartIndex];
    }

    return null;
  }

  private _isClickOutsideSelectableItem(element: EventTarget): boolean {
    if (!(element instanceof HTMLElement)) return false;

    if (element === this.host) return true;
    if (this._selectableItemsNative.includes(element)) return false;

    return this._isClickOutsideSelectableItem(element.parentElement);
  }
}
