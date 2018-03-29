import { Component, Input } from '@angular/core';

@Component({
  selector: 'ngx-shortcuts',
  templateUrl: './shortcuts.component.html',
  styleUrls: ['./shortcuts.component.scss']
})
export class ShortcutsComponent {
  @Input() os: 'mac' | 'windows' = 'mac';
}
