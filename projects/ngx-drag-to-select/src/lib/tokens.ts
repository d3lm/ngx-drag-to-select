import { InjectionToken } from '@angular/core';
import { DragToSelectConfig, SelectContainer, ComponentType } from './models';

export const CONFIG = new InjectionToken<DragToSelectConfig>('DRAG_TO_SELECT_CONFIG');
export const USER_CONFIG = new InjectionToken<DragToSelectConfig>('USER_CONFIG');
export const DTS_SELECT_CONTAINER = new InjectionToken<ComponentType<SelectContainer>>('SelectContainerComponent');
