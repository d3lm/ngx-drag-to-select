import { Directive, ElementRef, Input, Inject, Renderer2, DoCheck } from '@angular/core';
import { Platform } from '@angular/cdk/platform';

import { CONFIG } from './tokens';
import { DragToSelectConfig } from './models';
import { calculateBoundingClientRect } from './utils';

@Directive({
  selector: '[selectItem]',
  exportAs: 'selectItem',
  host: {
    class: 'ngx-select-item'
  }
})
export class SelectItemDirective implements DoCheck {
  private _boundingClientRect;

  selected = false;

  @Input() selectItem;

  get value() {
    return this.selectItem ? this.selectItem : this;
  }

  constructor(
    @Inject(CONFIG) private config: DragToSelectConfig,
    private host: ElementRef,
    private renderer: Renderer2
  ) {}

  ngDoCheck() {
    this.applySelectedClass();
  }

  getBoundingClientRect() {
    return this._boundingClientRect;
  }

  select() {
    this.selected = true;
  }

  deselect() {
    this.selected = false;
  }

  calculateBoundingClientRect() {
    this._boundingClientRect = calculateBoundingClientRect(this.host.nativeElement);
  }

  private applySelectedClass() {
    if (this.selected) {
      this.renderer.addClass(this.host.nativeElement, this.config.selectedClass);
    } else {
      this.renderer.removeClass(this.host.nativeElement, this.config.selectedClass);
    }
  }
}
