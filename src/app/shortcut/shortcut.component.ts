import { Component, ViewEncapsulation, Input } from '@angular/core';

@Component({
  selector: 'app-shortcut',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="shortcut-container"><ng-content></ng-content></div>
    <ng-content select="app-shortcut-description"></ng-content>
  `,
  styleUrls: ['./shortcut.component.scss'],
})
export class ShortcutComponent {}

@Component({
  selector: 'app-key',
  template: ` <ng-content></ng-content> `,
})
export class KeyComponent {}

@Component({
  selector: 'app-modifier-key',
  template: `
    <ng-container [ngSwitch]="os">
      <app-key *ngSwitchCase="'mac'">⌘</app-key>
      <app-key *ngSwitchCase="'windows'">⌃</app-key>
    </ng-container>
  `,
})
export class ModifierKeyComponent {
  @Input()
  os;
}

@Component({
  selector: 'app-shortcut-description',
  template: ` <ng-content></ng-content> `,
})
export class ShortcutDescriptionComponent {}
