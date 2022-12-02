import { DEFAULT_CONFIG } from '../../projects/ngx-drag-to-select/src/lib/config';

import { getDoingList, getDragAndDropExample, getTodoList } from '../support/utils';

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
          // select first 3 items in list
          .dispatch('mousedown', 'topLeft', { button: 0 })
          .getSelectItem(2)
          .dispatch('mousemove')
          .dispatch('mouseup')
          // click on second item
          .getSelectItem(1)
          .dispatch('mousedown', { button: 0 })
          // drag to SelectItem in other list
          .getSelectItem(5)
          .wait(16)
          .dispatch('mousemove', { force: true })
          .dispatch('mousemove', { force: true })
          .dispatch('mouseup');

        getDoingList().within(() => {
          cy.get('app-task').should('have.length', 5);
        });
      });
    });

    it('should reorder within list', () => {
      getDragAndDropExample().within(() => {
        getTodoList()
          .dispatch('mousedown', 'topRight', { button: 0 })
          .getSelectItem(1)
          .dispatch('mousemove')
          .dispatch('mouseup')
          .getSelectItem(0)
          .dispatch('mousedown', 'bottom', { button: 0 })
          .getSelectItem(4)
          .dispatch('mousemove', { force: true })
          .dispatch('mousemove', { force: true })
          .dispatch('mouseup');

        cy.get('app-task').eq(0).should('contain', 'Open Ticket #1');
        cy.get('app-task').eq(1).should('contain', 'Open Ticket #2');
      });
    });
  });
});
