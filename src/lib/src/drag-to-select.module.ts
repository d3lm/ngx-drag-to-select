import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformModule } from '@angular/cdk/platform';

import { SelectContainerComponent } from './select-container.component';
import { SelectItemDirective } from './select-item.directive';
import { ShortcutService } from './shortcut.service';
import { DragToSelectConfig } from './models';
import { CONFIG } from './tokens';
import { DEFAULT_CONFIG } from './config';
import { mergeDeep } from './utils';

const COMPONENTS = [SelectContainerComponent, SelectItemDirective];

@NgModule({
  imports: [CommonModule, PlatformModule],
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS]
})
export class DragToSelectModule {
  static forRoot(config: Partial<DragToSelectConfig> = {}): ModuleWithProviders {
    return {
      ngModule: DragToSelectModule,
      providers: [ShortcutService, { provide: CONFIG, useValue: mergeDeep(DEFAULT_CONFIG, config) }]
    };
  }
}
