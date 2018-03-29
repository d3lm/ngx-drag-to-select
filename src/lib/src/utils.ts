import { SelectItemDirective } from './select-item.directive';

export const isObject = (item: any) => {
  return item && typeof item === 'object' && !Array.isArray(item) && item !== null;
};

export const mergeDeep = (target: Object, source: Object) => {
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
};

export const clearSelection = (window: Window) => {
  const selection = window.getSelection();

  if (selection.removeAllRanges) {
    selection.removeAllRanges();
  } else if (selection.empty) {
    selection.empty();
  }
};

export const inBoundingBox = (point, box) => {
  return box.x <= point.x && point.x <= box.x + box.width && box.y <= point.y && point.y <= box.y + box.height;
};

export const cursorWithinElement = (event: MouseEvent, element: HTMLElement, window: Window) => {
  const mousePoint = { x: event.pageX, y: event.pageY };
  return inBoundingBox(mousePoint, calculateBoundingClientRect(element, window));
};

export const calculateBoundingClientRect = (element: HTMLElement, window: Window) => {
  const boundingRect = <ClientRect>element.getBoundingClientRect();
  const { pageXOffset, pageYOffset } = window;

  return {
    x: boundingRect.left + pageXOffset,
    y: boundingRect.top + pageYOffset,
    top: boundingRect.top + pageYOffset,
    left: boundingRect.left,
    width: boundingRect.width,
    height: boundingRect.height
  };
};
