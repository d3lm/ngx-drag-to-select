import { DragToSelectConfig } from './models';

export const DEFAULT_CONFIG: DragToSelectConfig = {
  selectedClass: 'selected',
  shortcuts: {
    disableSelection: 'alt',
    toggleSingleItem: 'meta',
    addToSelection: 'shift',
    removeFromSelection: 'shift+meta'
  }
};
