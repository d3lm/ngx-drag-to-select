import { isPlatformBrowser } from '@angular/common';

import {
  Directive,
  DoCheck,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  PLATFORM_ID,
  Renderer2
} from '@angular/core';

import { DragToSelectConfig } from './models';
import { CONFIG } from './tokens';
import { calculateBoundingClientRect } from './utils';

@Directive({
  selector: '[dtsSelectItem]',
  exportAs: 'dtsSelectItem',
  host: {
    class: 'dts-select-item'
  }
})
export class SelectItemDirective implements OnInit, DoCheck {
  private _boundingClientRect;

  selected = false;

  @Input()
  dtsSelectItem;

  get value() {
    return this.dtsSelectItem ? this.dtsSelectItem : this;
  }

  constructor(
    @Inject(CONFIG) private config: DragToSelectConfig,
    @Inject(PLATFORM_ID) private platformId,
    private host: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.calculateBoundingClientRect();
    }
  }

  ngDoCheck() {
    this.applySelectedClass();
  }

  getBoundingClientRect() {
    return this._boundingClientRect;
  }

  calculateBoundingClientRect() {
    this._boundingClientRect = calculateBoundingClientRect(this.host.nativeElement);
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
