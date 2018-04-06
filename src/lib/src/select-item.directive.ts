import { Platform } from '@angular/cdk/platform';
import { Directive, DoCheck, ElementRef, Inject, Input, OnInit, Renderer2 } from '@angular/core';
import { DragToSelectConfig } from './models';
import { CONFIG } from './tokens';
import { calculateBoundingClientRect } from './utils';

@Directive({
  selector: '[selectItem]',
  exportAs: 'selectItem',
  host: {
    class: 'ngx-select-item'
  }
})
export class SelectItemDirective implements OnInit, DoCheck {
  private _boundingClientRect;

  selected = false;

  @Input() selectItem;

  get value() {
    return this.selectItem ? this.selectItem : this;
  }

  constructor(
    @Inject(CONFIG) private config: DragToSelectConfig,
    private platform: Platform,
    private host: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    if (this.platform.isBrowser) {
      setTimeout(() => this.calculateBoundingClientRect());
    }
  }

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
