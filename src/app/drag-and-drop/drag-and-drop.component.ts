import { Component } from '@angular/core';

@Component({
  selector: 'app-drag-and-drop',
  templateUrl: './drag-and-drop.component.html',
  styleUrls: ['./drag-and-drop.component.scss'],
})
export class DragAndDropComponent {
  todo = ['Next Task', 'Very Important Item', 'Open Ticket #1', 'Open Ticket #2', 'Not Important Task'];
  doing = ['High Priority Task', 'In Progress Item'];
  done = ['Completed Item'];
  selectedItems: any[] = [];
}
