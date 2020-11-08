import { Component } from '@angular/core';
import { CdkDragDrop, CdkDragStart, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-dragndrop',
  templateUrl: './dragndrop.component.html',
  styleUrls: ['./dragndrop.component.scss'],
})
export class DragNDropComponent {
  todo = ['Next Task', 'Very Important Item', 'Open Ticket #1', 'Open Ticket #2', 'Not Important Task'];
  doing = ['High Priority Task', 'In Progress Item'];
  done = ['Completed Item'];
  selectedItems: any[] = [];
}
