import { LayoutModule } from '@angular/cdk/layout';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { DragToSelectModule } from '../../projects/ngx-drag-to-select/src/public_api';

import { AppComponent } from './app.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { PhoneComponent } from './phone/phone.component';

import {
  KeyComponent,
  ModifierKeyComponent,
  ShortcutComponent,
  ShortcutDescriptionComponent,
} from './shortcut/shortcut.component';

import { ShortcutsComponent } from './shortcuts/shortcuts.component';

const MATERIAL_MODULES = [
  MatCheckboxModule,
  MatGridListModule,
  MatChipsModule,
  MatTabsModule,
  MatIconModule,
  MatButtonModule,
  MatSelectModule,
];

@NgModule({
  declarations: [
    AppComponent,
    KeyComponent,
    ShortcutComponent,
    ShortcutDescriptionComponent,
    ShortcutsComponent,
    ModifierKeyComponent,
    FooterComponent,
    HeaderComponent,
    PhoneComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'demo-app' }),
    HttpClientModule,
    BrowserAnimationsModule,
    LayoutModule,
    FormsModule,
    ...MATERIAL_MODULES,
    DragToSelectModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
