import {
  Directive,
  ElementRef,
  HostBinding,
  Input,
  NgZone,
  AfterViewInit,
  OnDestroy,
  Inject,
  Renderer2,
  DoCheck
} from '@angular/core';

import { Platform } from '@angular/cdk/platform';

import { Subject } from 'rxjs/Subject';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { merge } from 'rxjs/observable/merge';
import { auditTime, takeUntil } from 'rxjs/operators';

import { CONFIG } from './tokens';
import { DragToSelectConfig } from './models';
import { AUDIT_TIME } from './constants';
import { calculateBoundingClientRect } from './utils';

@Directive({
  selector: '[selectItem]',
  exportAs: 'selectItem',
  host: {
    class: 'ngx-select-item'
  }
})
export class SelectItemDirective implements AfterViewInit, OnDestroy, DoCheck {
  private _boundingClientRect;
  private readonly destroy$ = new Subject<void>();

  selected = false;

  @Input() selectItem;

  get value() {
    return this.selectItem ? this.selectItem : this;
  }

  constructor(
    @Inject(CONFIG) private config: DragToSelectConfig,
    private host: ElementRef,
    private ngZone: NgZone,
    private platform: Platform,
    private renderer: Renderer2
  ) {}

  ngDoCheck() {
    this.applySelectedClass();
  }

  ngAfterViewInit() {
    if (this.platform.isBrowser) {
      this.ngZone.runOutsideAngular(() => {
        const resize$ = fromEvent(window, 'resize');
        const scroll$ = fromEvent(window, 'scroll');

        merge(resize$, scroll$)
          .pipe(auditTime(AUDIT_TIME), takeUntil(this.destroy$))
          .subscribe(() => this.setBoundingClientRect());
      });

      setTimeout(() => {
        this.setBoundingClientRect();
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getBoundingClientRect() {
    return this._boundingClientRect;
  }

  select() {
    this.selected = true;
  }

  unselect() {
    this.selected = false;
  }

  private setBoundingClientRect() {
    this._boundingClientRect = calculateBoundingClientRect(this.host.nativeElement, window);
  }

  private applySelectedClass() {
    if (this.selected) {
      this.renderer.addClass(this.host.nativeElement, this.config.selectedClass);
    } else {
      this.renderer.removeClass(this.host.nativeElement, this.config.selectedClass);
    }
  }
}
