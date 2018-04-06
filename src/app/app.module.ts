import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ModuleMapLoaderModule } from '@nguniversal/module-map-ngfactory-loader';

import {
  MatCheckboxModule,
  MatGridListModule,
  MatChipsModule,
  MatTabsModule,
  MatIconModule,
  MatButtonModule
} from '@angular/material';

import { AppComponent } from './app.component';
import { DragToSelectModule } from '../lib/public_api';

import {
  ShortcutComponent,
  KeyComponent,
  ShortcutDescriptionComponent,
  ModifierKeyComponent
} from './shortcut/shortcut.component';

import { ShortcutsComponent } from './shortcuts/shortcuts.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { PhoneComponent } from './phone/phone.component';

const MATERIAL_MODULES = [
  MatCheckboxModule,
  MatGridListModule,
  MatChipsModule,
  MatTabsModule,
  MatIconModule,
  MatButtonModule
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
    PhoneComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'demo-app' }),
    ModuleMapLoaderModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ...MATERIAL_MODULES,
    DragToSelectModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
