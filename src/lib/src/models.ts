import { Observable } from 'rxjs/Observable';
import { SelectItemDirective } from '../public_api';

export interface ObservableProxy<T> {
  proxy$: Observable<any>;
  proxy: T;
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

export type SelectBoxInput = [MouseEvent, number, Partial<SelectBox<number>>];

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
