import { Observable } from 'rxjs/Observable';
import { map, finalize } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { SelectBox, SelectBoxInput, ObservableProxy, MousePosition, SelectContainerHost } from './models';
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

export const observableProxy = <T extends Object>(proxyTarget: T): ObservableProxy<T> => {
  const subject = new Subject<any>();

  const { proxy, revoke } = Proxy.revocable(proxyTarget, {
    set: (target, prop, value) => {
      const success = Reflect.set(target, prop, value);
      subject.next();
      return success;
    },
    deleteProperty: (target, prop) => {
      const success = Reflect.deleteProperty(target, prop);
      subject.next();
      return success;
    }
  });

  return {
    proxy,
    proxy$: subject.pipe(
      finalize(() => {
        subject.complete();
        revoke();
      })
    )
  };
};
