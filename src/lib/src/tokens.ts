import { InjectionToken } from '@angular/core';
import { DragToSelectConfig } from './models';

export const CONFIG = new InjectionToken<DragToSelectConfig>('DRAG_TO_SELECT_CONFIG');
export const USER_CONFIG = new InjectionToken<DragToSelectConfig>('USER_CONFIG');
