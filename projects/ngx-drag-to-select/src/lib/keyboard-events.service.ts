import { Injectable } from '@angular/core';
import { share } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { distinctKeyEvents } from './operators';

@Injectable()
export class KeyboardEventsService {
  keydown$ = fromEvent<KeyboardEvent>(window, 'keydown').pipe(share());
  keyup$ = fromEvent<KeyboardEvent>(window, 'keyup').pipe(share());

  // distinctKeyEvents is used to prevent multiple key events to be fired repeatedly
  // on Windows when a key is being pressed

  distinctKeydown$ = this.keydown$.pipe(
    distinctKeyEvents(),
    share()
  );

  distinctKeyup$ = this.keyup$.pipe(
    distinctKeyEvents(),
    share()
  );

  mouseup$ = fromEvent<MouseEvent>(window, 'mouseup').pipe(share());
  mousemove$ = fromEvent<MouseEvent>(window, 'mousemove').pipe(share());
}
