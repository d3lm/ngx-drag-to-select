import { isPlatformBrowser } from '@angular/common';

import {
  Directive,
  DoCheck,
  ElementRef,
  Inject,
  Input,
  PLATFORM_ID,
  Renderer2,
  OnInit,
  HostBinding,
  Optional,
  SkipSelf,
  OnDestroy,
} from '@angular/core';

import { DragToSelectConfig, BoundingBox } from './models';
import { DTS_SELECT_CONTAINER, SelectContainerComponent } from './select-container.component';
import { CONFIG } from './tokens';
import { calculateBoundingClientRect } from './utils';

export const SELECT_ITEM_INSTANCE = Symbol();

@Directive({
  selector: '[dtsSelectItem]',
  exportAs: 'dtsSelectItem',
})
export class SelectItemDirective implements OnInit, DoCheck, OnDestroy {
  private _boundingClientRect: BoundingBox | undefined;

  selected = false;

  @HostBinding('class.dts-range-start')
  rangeStart = false;

  @HostBinding('class.dts-select-item')
  readonly hostClass = true;

  @Input() dtsSelectItem: any | undefined;

  @Input()
  @HostBinding('class.dts-disabled')
  dtsDisabled = false;

  get value(): SelectItemDirective | any {
    return this.dtsSelectItem != null ? this.dtsSelectItem : this;
  }

  constructor(
    @Inject(CONFIG) private config: DragToSelectConfig,
    @Inject(PLATFORM_ID) private platformId: Record<string, unknown>,
    @Inject(DTS_SELECT_CONTAINER) @Optional() @SkipSelf() public container: SelectContainerComponent,
    private host: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.nativeElememnt[SELECT_ITEM_INSTANCE] = this;
    this.container.register(this);
  }

  ngDoCheck() {
    this.applySelectedClass();
  }

  ngOnDestroy() {
    this.container.unregister(this);
  }

  toggleRangeStart() {
    this.rangeStart = !this.rangeStart;
  }

  get nativeElememnt() {
    return this.host.nativeElement;
  }

  getBoundingClientRect() {
    if (isPlatformBrowser(this.platformId) && !this._boundingClientRect) {
      this.calculateBoundingClientRect();
    }
    return this._boundingClientRect;
  }

  calculateBoundingClientRect() {
    const boundingBox = calculateBoundingClientRect(this.host.nativeElement);
    this._boundingClientRect = boundingBox;
    return boundingBox;
  }

  _select() {
    this.selected = true;
  }

  _deselect() {
    this.selected = false;
  }

  private applySelectedClass() {
    if (this.selected) {
      this.renderer.addClass(this.host.nativeElement, this.config.selectedClass);
    } else {
      this.renderer.removeClass(this.host.nativeElement, this.config.selectedClass);
    }
  }
}
