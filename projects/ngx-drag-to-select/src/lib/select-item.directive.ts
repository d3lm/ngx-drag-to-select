import { isPlatformBrowser } from '@angular/common';

import { Directive, DoCheck, ElementRef, Inject, Input, PLATFORM_ID, Renderer2 } from '@angular/core';

import { DragToSelectConfig } from './models';
import { CONFIG } from './tokens';
import { calculateBoundingClientRect } from './utils';
import { Subject } from 'rxjs';

@Directive({
  selector: '[dtsSelectItem]',
  exportAs: 'dtsSelectItem',
  host: {
    class: 'dts-select-item'
  }
})
export class SelectItemDirective implements DoCheck {
  private _boundingClientRect;

  private _selected = false;

  public onchanged = new Subject<boolean>();

  @Input()
  dtsSelectItem;

  public get selected() {
    return this._selected;
  }

  public set selected(value: boolean) {
    this._selected = value;
    this.onchanged.next(value);
  }

  get value() {
    return this.dtsSelectItem ? this.dtsSelectItem : this;
  }

  constructor(
    @Inject(CONFIG) private config: DragToSelectConfig,
    @Inject(PLATFORM_ID) private platformId,
    private host: ElementRef,
    private renderer: Renderer2
  ) {}

  ngDoCheck() {
    this.applySelectedClass();
  }

  getBoundingClientRect() {
    if (isPlatformBrowser(this.platformId) && !this._boundingClientRect) {
      this.calculateBoundingClientRect();
    }
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
