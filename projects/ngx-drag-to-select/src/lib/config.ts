import { DragToSelectConfig } from './models';

export const DEFAULT_CONFIG: DragToSelectConfig = {
  selectedClass: 'selected',
  shortcuts: {
    moveRangeStart: 'shift+r',
    disableSelection: 'alt',
    toggleSingleItem: 'meta',
    addToSelection: 'shift',
    removeFromSelection: 'shift+meta'
  }
};
