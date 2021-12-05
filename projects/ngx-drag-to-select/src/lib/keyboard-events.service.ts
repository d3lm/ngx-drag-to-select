import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { share } from 'rxjs/operators';
import { distinctKeyEvents } from './operators';

@Injectable()
export class KeyboardEventsService {
  keydown$: Observable<KeyboardEvent>;
  keyup$: Observable<KeyboardEvent>;
  distinctKeydown$: Observable<KeyboardEvent>;
  distinctKeyup$: Observable<KeyboardEvent>;
  mouseup$: Observable<MouseEvent>;
  mousemove$: Observable<MouseEvent>;

  constructor(@Inject(PLATFORM_ID) private platformId: Record<string, unknown>) {
    if (isPlatformBrowser(this.platformId)) {
      this._initializeKeyboardStreams();
    }
  }

  private _initializeKeyboardStreams() {
    this.keydown$ = fromEvent<KeyboardEvent>(window, 'keydown').pipe(share());
    this.keyup$ = fromEvent<KeyboardEvent>(window, 'keyup').pipe(share());

    // distinctKeyEvents is used to prevent multiple key events to be fired repeatedly
    // on Windows when a key is being pressed

    this.distinctKeydown$ = this.keydown$.pipe(distinctKeyEvents(), share());

    this.distinctKeyup$ = this.keyup$.pipe(distinctKeyEvents(), share());

    this.mouseup$ = fromEvent<MouseEvent>(window, 'mouseup').pipe(share());
    this.mousemove$ = fromEvent<MouseEvent>(window, 'mousemove').pipe(share());
  }
}
