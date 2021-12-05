import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { DEFAULT_CONFIG } from './config';
import { KeyboardEventsService } from './keyboard-events.service';
import { DragToSelectConfig } from './models';
import { SelectContainerComponent } from './select-container.component';
import { SelectItemDirective } from './select-item.directive';
import { ShortcutService } from './shortcut.service';
import { CONFIG, USER_CONFIG } from './tokens';
import { mergeDeep } from './utils';

const COMPONENTS = [SelectContainerComponent, SelectItemDirective];

function configFactory(config: Partial<DragToSelectConfig>) {
  return mergeDeep(DEFAULT_CONFIG, config);
}

@NgModule({
  imports: [CommonModule],
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS],
})
export class DragToSelectModule {
  static forRoot(config: Partial<DragToSelectConfig> = {}): ModuleWithProviders<DragToSelectModule> {
    return {
      ngModule: DragToSelectModule,
      providers: [
        ShortcutService,
        KeyboardEventsService,
        { provide: USER_CONFIG, useValue: config },
        {
          provide: CONFIG,
          useFactory: configFactory,
          deps: [USER_CONFIG],
        },
      ],
    };
  }
}
