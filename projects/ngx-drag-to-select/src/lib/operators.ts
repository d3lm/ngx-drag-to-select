import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SelectBox, SelectBoxInput, SelectContainerHost, MousePosition } from './models';
import { getRelativeMousePosition } from './utils';

export const createSelectBox = (container: SelectContainerHost) => (
  source: Observable<SelectBoxInput>
): Observable<SelectBox<number>> =>
  source.pipe(
    map(([event, opacity, { x, y }]) => {
      // Type annotation is required here, because `getRelativeMousePosition` returns a `MousePosition`,
      // the TS compiler cannot figure out the shape of this type.
      const mousePosition: MousePosition = getRelativeMousePosition(event, container);

      const width = opacity > 0 ? mousePosition.x - x : 0;
      const height = opacity > 0 ? mousePosition.y - y : 0;

      return {
        top: height < 0 ? mousePosition.y : y,
        left: width < 0 ? mousePosition.x : x,
        width: Math.abs(width),
        height: Math.abs(height),
        opacity
      };
    })
  );
