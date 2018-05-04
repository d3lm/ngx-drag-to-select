import { Observable } from 'rxjs';

export interface ObservableProxy<T> {
  proxy$: Observable<any>;
  proxy: T;
}

export interface SelectContainerHost extends HTMLElement {
  boundingClientRect: BoundingBox;
}

export interface Shortcuts {
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
  None
}
