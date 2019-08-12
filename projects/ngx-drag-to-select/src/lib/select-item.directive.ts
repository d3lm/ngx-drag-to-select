import { isPlatformBrowser } from '@angular/common';

import { Directive, DoCheck, ElementRef, Inject, Input, PLATFORM_ID, Renderer2, Host } from '@angular/core';

import { DragToSelectConfig } from './models';
import { CONFIG } from './tokens';
import { calculateBoundingClientRect } from './utils';
import { SelectContainerComponent } from './select-container.component';

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

  private selectContainer: SelectContainerComponent = null;

  @Input()
  dtsSelectItem;

  public setContainer(selectContainer: SelectContainerComponent) {
    this.selectContainer = selectContainer;
  }

  public get selected() {
    return this._selected;
  }

  public set selected(value: boolean) {
    // If Changed
    if (this.selected !== value && this.selectContainer !== null) {
      if (value === true) this.selectContainer.selectItems(item => item === this.dtsSelectItem);
      else this.selectContainer.deselectItems(item => item === this.dtsSelectItem);
    }
    this._selected = value;
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
    this._selected = true;
  }

  _deselect() {
    this._selected = false;
  }

  private applySelectedClass() {
    if (this.selected) {
      this.renderer.addClass(this.host.nativeElement, this.config.selectedClass);
    } else {
      this.renderer.removeClass(this.host.nativeElement, this.config.selectedClass);
    }
  }
}
