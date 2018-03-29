import { Component, ViewEncapsulation, Input } from '@angular/core';

@Component({
  selector: 'ngx-shortcut',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="shortcut-container">
      <ng-content></ng-content>
    </div>
    <ng-content select="ngx-shortcut-description"></ng-content>
  `,
  styleUrls: ['./shortcut.component.scss']
})
export class ShortcutComponent {}

@Component({
  selector: 'ngx-key',
  template: `
    <ng-content></ng-content>
  `
})
export class KeyComponent {}

@Component({
  selector: 'ngx-modifier-key',
  template: `
    <ng-container [ngSwitch]="os">
      <ngx-key *ngSwitchCase="'mac'">⌘</ngx-key>
      <ngx-key *ngSwitchCase="'windows'">⌃</ngx-key>
    </ng-container>
  `
})
export class ModifierKeyComponent {
  @Input() os;
}

@Component({
  selector: 'ngx-shortcut-description',
  template: `
    <ng-content></ng-content>
  `
})
export class ShortcutDescriptionComponent {}
