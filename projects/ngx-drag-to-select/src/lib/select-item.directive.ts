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
} from '@angular/core';

import { DragToSelectConfig, BoundingBox } from './models';
import { CONFIG } from './tokens';
import { calculateBoundingClientRect } from './utils';

export const SELECT_ITEM_INSTANCE = Symbol();

@Directive({
  selector: '[dtsSelectItem]',
  exportAs: 'dtsSelectItem',
  host: {
    class: 'dts-select-item',
  },
})
export class SelectItemDirective implements OnInit, DoCheck {
  private _boundingClientRect: BoundingBox | undefined;

  selected = false;

  @HostBinding('class.dts-range-start') rangeStart = false;

  @Input() dtsSelectItem: any | undefined;

  get value(): SelectItemDirective | any {
    return this.dtsSelectItem ? this.dtsSelectItem : this;
  }

  constructor(
    @Inject(CONFIG) private config: DragToSelectConfig,
    @Inject(PLATFORM_ID) private platformId: Object,
    private host: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.nativeElememnt[SELECT_ITEM_INSTANCE] = this;
  }

  ngDoCheck() {
    this.applySelectedClass();
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
