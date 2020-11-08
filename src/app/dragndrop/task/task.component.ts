import { Component, Inject, Input, Optional, SkipSelf } from '@angular/core';
import { SelectContainerComponent } from 'projects/ngx-drag-to-select/src/public_api';
import { DTS_SELECT_CONTAINER } from 'projects/ngx-drag-to-select/src/lib/tokens';

@Component({
  selector: 'app-task',
  styleUrls: ['./task.component.scss'],
  templateUrl: './task.component.html',
})
export class TaskComponent {
  @Input() item = '';
  // @Input() selectedItems = [];
  constructor(@Inject(DTS_SELECT_CONTAINER) @Optional() @SkipSelf() public container: SelectContainerComponent) {}
}
