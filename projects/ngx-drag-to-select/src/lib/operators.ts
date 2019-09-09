import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, withLatestFrom } from 'rxjs/operators';
import { MousePosition, SelectBox, SelectBoxInput, SelectContainerHost } from './models';
import { getRelativeMousePosition, hasMinimumSize } from './utils';

export const createSelectBox = (container: SelectContainerHost) => (
  source: Observable<SelectBoxInput>
): Observable<SelectBox<number>> =>
  source.pipe(
    map(([event, opacity, { x, y }, scale]) => {
      // Type annotation is required here, because `getRelativeMousePosition` returns a `MousePosition`,
      // the TS compiler cannot figure out the shape of this type.
      const mousePosition: MousePosition = getRelativeMousePosition(event, container);
      const width = opacity > 0 ? mousePosition.x - x : 0;
      const height = opacity > 0 ? mousePosition.y - y : 0;

      if (scale <= 0) {
        console.error('scale can not less than zero:', scale);
        scale = 1;
      }
      return {
        top: (height < 0 ? mousePosition.y : y) / scale,
        left: (width < 0 ? mousePosition.x : x) / scale,
        width: Math.abs(width) / scale,
        height: Math.abs(height) / scale,
        opacity
      };
    })
  );

export const whenSelectBoxVisible = (selectBox$: Observable<SelectBox<number>>) => (source: Observable<Event>) =>
  source.pipe(
    withLatestFrom(selectBox$),
    filter(([, selectBox]) => hasMinimumSize(selectBox, 0, 0)),
    map(([event, _]) => event)
  );

export const distinctKeyEvents = () => (source: Observable<KeyboardEvent>) =>
  source.pipe(
    distinctUntilChanged((prev, curr) => {
      // tslint:disable-next-line: deprecation
      return prev.keyCode === curr.keyCode;
    })
  );
