import { CdkDragStart, CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, HostBinding, Inject, Input, Optional, SkipSelf } from '@angular/core';
import { DTS_SELECT_CONTAINER } from 'projects/ngx-drag-to-select/src/lib/tokens';
import { SelectContainerComponent } from 'projects/ngx-drag-to-select/src/public_api';

@Component({
  selector: 'app-task-list',
  styleUrls: ['./task-list.component.scss'],
  templateUrl: './task-list.component.html',
})
export class TaskListComponent {
  @Input() title = 'Tasks';
  @Input() tasks = [];

  @HostBinding('class.item-dragging')
  dragging = false;

  constructor(@Inject(DTS_SELECT_CONTAINER) @Optional() public container: SelectContainerComponent) {}

  dragStarted(ev: CdkDragStart, index: number): void {
    this.dragging = !!ev.source._dragRef;
    this.container.selectItems((item) => {
      return item === this.tasks[index];
    });
  }

  dragEnded(): void {
    this.dragging = null;
  }

  dropped(event: CdkDragDrop<any>): void {
    this.dragging = null;
    const indices = this.container.selectedItems.map((it) => event.previousContainer.data.findIndex((i) => it === i));
    indices.sort().reverse();
    indices.forEach((idx) => {
      this.tasks.splice(idx, 1);
    });

    setTimeout(() => this.container.clearSelection());
  }

  drop(event: CdkDragDrop<string[]>) {
    const indices = this.container.selectedItems.map((it) => event.previousContainer.data.findIndex((i) => it === i));
    console.log('Selected', indices);

    const spliceIntoIndex = event.currentIndex;
    this.tasks.splice(spliceIntoIndex, 0, ...this.container.selectedItems);

    /**
     * Caution!
     * When drop event is within the same drop-list the bounding box of
     * drag events might not update to there new positions.  Use the
     * `update` method from the `SelectContainerComponent` to force the
     * bounding boxes to be recalculated.
     * This is put behind `setTimeout` because we have to wait until the next
     * frame before angular change detection has updated the dom.
     * */
    setTimeout(() => this.container.update());
  }
}
