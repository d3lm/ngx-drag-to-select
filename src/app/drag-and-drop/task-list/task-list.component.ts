import { CdkDragStart, CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, ElementRef, HostBinding, Inject, Input, Optional, SkipSelf } from '@angular/core';
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

  // CdkDragModule only supports dragging a single dom element
  private selectDomRefs: { parent: Node; node: Node }[] = [];

  constructor(
    @Inject(DTS_SELECT_CONTAINER) @Optional() public container: SelectContainerComponent,
    private element: ElementRef
  ) {}

  dragStarted(ev: CdkDragStart, index: number): void {
    this.dragging = !!ev.source._dragRef;
    this.container.selectItems((item) => {
      return item === this.tasks[index];
    });

    /**
     * We remove the selected elements from the DOM, because the
     * CdkDragDropModule includes them when reordering even if they.
     * are hidden.
     **/
    this.selectDomRefs = [];
    this.element.nativeElement.querySelectorAll('.selected').forEach((node: Node) => {
      this.selectDomRefs.push({ parent: node.parentNode, node });
      node.parentNode.removeChild(node);
    });
  }

  dragEnded(): void {
    /**
     * Add the DOM elements back in because the Angular refs are still
     * bound to them.
     **/
    this.selectDomRefs.forEach(({ parent, node }) => {
      parent.appendChild(node);
    });
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
