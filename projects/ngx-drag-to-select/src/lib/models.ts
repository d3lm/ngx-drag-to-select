import { Observable } from 'rxjs';
import { SelectItemDirective } from './select-item.directive';

export type PredicateFn<T> = (item: T) => boolean;

export enum UpdateActions {
  Add,
  Remove,
}

export interface UpdateAction {
  type: UpdateActions;
  item: SelectItemDirective;
}

export interface ObservableProxy<T> {
  proxy$: Observable<any>;
  proxy: T;
}

export interface SelectContainerHost extends HTMLElement {
  boundingClientRect: BoundingBox;
}

export interface Shortcuts {
  moveRangeStart: string;
  disableSelection: string;
  toggleSingleItem: string;
  addToSelection: string;
  removeFromSelection: string;
}

export interface DragToSelectConfig {
  selectedClass: string;
  shortcuts: Partial<Shortcuts>;
}

export interface MousePosition {
  x: number;
  y: number;
}

export interface BoundingBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type SelectBoxInput = [MouseEvent, number, MousePosition];

export interface SelectBox<T> {
  top: T;
  left: T;
  width: T;
  height: T;
  opacity: number;
}

export enum Action {
  Add,
  Delete,
  None,
}

export interface SelectContainer<T = any> {
  selectedItems: T[];
  register(item: T): void;
  unregister(item: T): void;
}

export type ComponentType<T> = new (...args: any[]) => T;
