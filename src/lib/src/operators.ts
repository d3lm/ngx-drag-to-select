import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { SelectBox, SelectBoxInput, SelectContainerHost } from './models';
import { getRelativeMousePosition } from './utils';

export const createSelectBox = (container: SelectContainerHost) => (
  source: Observable<SelectBoxInput>
): Observable<SelectBox<number>> =>
  source.pipe(
    map(([event, opacity, { x, y }]) => {
      const mousePosition = getRelativeMousePosition(event, container);

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
