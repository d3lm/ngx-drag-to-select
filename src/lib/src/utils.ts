import { MousePosition, SelectBox, BoundingBox, SelectContainerHost } from './models';

export const isObject = (item: any) => {
  return item && typeof item === 'object' && !Array.isArray(item) && item !== null;
};

export function mergeDeep(target: Object, source: Object) {
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} });
        }
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    });
  }

  return target;
}

export const clearSelection = (window: Window) => {
  const selection = window.getSelection();

  if (selection.removeAllRanges) {
    selection.removeAllRanges();
  } else if (selection.empty) {
    selection.empty();
  }
};

export const inBoundingBox = (point: MousePosition, box: BoundingBox) => {
  return (
    box.left <= point.x && point.x <= box.left + box.width && box.top <= point.y && point.y <= box.top + box.height
  );
};

export const boxIntersects = (boxA: BoundingBox, boxB: BoundingBox) => {
  return (
    boxA.left <= boxB.left + boxB.width &&
    boxA.left + boxA.width >= boxB.left &&
    boxA.top <= boxB.top + boxB.height &&
    boxA.top + boxA.height >= boxB.top
  );
};

export const calculateBoundingClientRect = (element: HTMLElement): BoundingBox => {
  return element.getBoundingClientRect();
};

export const getMousePosition = (event: MouseEvent) => {
  return {
    x: event.clientX,
    y: event.clientY
  };
};

export const getScroll = () => {
  if (!document) {
    return {
      x: 0,
      y: 0
    };
  }

  return {
    x: document.documentElement.scrollLeft || document.body.scrollLeft,
    y: document.documentElement.scrollTop || document.body.scrollTop
  };
};

export const getRelativeMousePosition = (event: MouseEvent, container: SelectContainerHost): MousePosition => {
  const { x: clientX, y: clientY } = getMousePosition(event);
  const scroll = getScroll();

  const borderSize = (container.boundingClientRect.width - container.clientWidth) / 2;
  const offsetLeft = container.boundingClientRect.left + scroll.x;
  const offsetTop = container.boundingClientRect.top + scroll.y;

  return {
    x: clientX - borderSize - (offsetLeft - window.pageXOffset) + container.scrollLeft,
    y: clientY - borderSize - (offsetTop - window.pageYOffset) + container.scrollTop
  };
};

export const cursorWithinElement = (event: MouseEvent, element: HTMLElement) => {
  const mousePoint = getMousePosition(event);
  return inBoundingBox(mousePoint, calculateBoundingClientRect(element));
};
