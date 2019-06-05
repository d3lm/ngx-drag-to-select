import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SelectContainerComponent } from './select-container.component';
import { SelectItemDirective } from './select-item.directive';
import { ShortcutService } from './shortcut.service';
import { DragToSelectConfig } from './models';
import { CONFIG, USER_CONFIG } from './tokens';
import { DEFAULT_CONFIG } from './config';
import { mergeDeep } from './utils';

export function CONFIG_FACTORY(config: Partial<DragToSelectConfig>) {
  return mergeDeep(DEFAULT_CONFIG, config);
}

@NgModule({
  imports: [CommonModule],
  declarations: [SelectContainerComponent, SelectItemDirective],
  exports: [SelectContainerComponent, SelectItemDirective]
})
export class DragToSelectModule {
  static forRoot(config: Partial<DragToSelectConfig> = {}): ModuleWithProviders {
    return {
      ngModule: DragToSelectModule,
      providers: [
        ShortcutService,
        { provide: USER_CONFIG, useValue: config },
        {
          provide: CONFIG,
          useFactory: CONFIG_FACTORY,
          deps: [USER_CONFIG]
        }
      ]
    };
  }
}
