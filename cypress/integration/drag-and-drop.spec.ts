import { DEFAULT_CONFIG } from '../../projects/ngx-drag-to-select/src/lib/config';

import {
  disableSelection,
  disableSelectOnDrag,
  enableSelectMode,
  getDesktopExample,
  getDoingList,
  getDragAndDropExample,
  getTodoList,
  shouldBeInvisible,
  shouldBeVisible,
  toggleItem,
} from '../support/utils';

const SELECTED_CLASS = DEFAULT_CONFIG.selectedClass;

describe('Drag And Drop', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Select on Drag', () => {
    it('should start new selection', () => {
      getDragAndDropExample().within(() => {
        getTodoList()
          .dispatch('mousedown', 'topLeft', { button: 0 })
          .getSelectItem(2)
          .dispatch('mousemove')
          .dispatch('mouseup');

        cy.get('.selected').should('have.length', 3);
      });
    });

    it('should drag to new list', () => {
      getDragAndDropExample().within(() => {
        getTodoList()
          // Select First 3 items in list
          .dispatch('mousedown', 'topLeft', { button: 0 })
          .getSelectItem(2)
          .dispatch('mousemove')
          .dispatch('mouseup')
          // Click on second item
          .getSelectItem(1)
          .dispatch('mousedown', { button: 0 })
          // Drag to Select Item in other list
          .getSelectItem(5)
          .wait(16)
          .dispatch('mousemove')
          .dispatch('mousemove')
          .dispatch('mouseup');

        getDoingList().within(() => {
          cy.get('app-task').should('have.length', 5);
        });
      });
    });

    it('should reorder within list', () => {
      getDragAndDropExample().within(() => {
        getTodoList()
          .dispatch('mousedown', 'bottomRight', { button: 0 })
          .getSelectItem(2)
          .dispatch('mousemove')
          .dispatch('mouseup')
          .getSelectItem(3)
          .dispatch('mousedown', { button: 0 })
          .getSelectItem(0)
          .wait(16)
          .dispatch('mousemove')
          .dispatch('mousemove')
          .dispatch('mouseup');

        cy.get('app-task').eq(0).should('contain', 'Open Ticket #1');
        cy.get('app-task').eq(1).should('contain', 'Open Ticket #2');
      });
    });
  });
});
