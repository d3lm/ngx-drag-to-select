import { DEFAULT_CONFIG } from '../../projects/ngx-drag-to-select/src/lib/config';
import { disableSelectOnDrag, enableSelectWithShortcut, getDesktopExample } from '../support/utils';

const SELECTED_CLASS = DEFAULT_CONFIG.selectedClass;

describe('Clicking', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should select single item on mousedown', () => {
    getDesktopExample().within(() => {
      cy.getSelectItem(0)
        .dispatch('mousedown', { button: 0 })
        .dispatch('mouseup')
        .shouldSelect([1])
        .get(`.${SELECTED_CLASS}`)
        .should('have.length', 1)
        .getSelectItem(1)
        .dispatch('mousedown', { button: 0 })
        .dispatch('mouseup')
        .shouldSelect([2])
        .get(`.${SELECTED_CLASS}`)
        .should('have.length', 1);
    });
  });

  it('should not select a single item when selectWithShortcut is true', () => {
    getDesktopExample().within(() => {
      enableSelectWithShortcut();
      cy.getSelectItem(0)
        .dispatch('mousedown', { button: 0 })
        .dispatch('mouseup')
        .shouldSelect([])
        .get(`.${SELECTED_CLASS}`)
        .should('have.length', 0);
    });
  });

  it('should not clear selected item when clicked outside of draggable area', () => {
    const mousePosition = { pageX: 0, pageY: 0 };

    getDesktopExample().within(() => {
      cy.getSelectItem(0)
        .as('end')
        .dispatch('mousedown', { button: 0 })
        .dispatch('mouseup')
        .shouldSelect([1])
        .get(`.${SELECTED_CLASS}`)
        .should('have.length', 1)
        .get('@end')
        .dispatch('mousedown', mousePosition, { button: 0 })
        .dispatch('mouseup', mousePosition)
        .shouldSelect([1])
        .get(`.${SELECTED_CLASS}`)
        .should('have.length', 1);
    });
  });

  it('should clear selected item when clicked inside draggable area', () => {
    getDesktopExample().within(() => {
      cy.getSelectItem(0)
        .dispatch('mousedown', { button: 0 })
        .dispatch('mouseup')
        .shouldSelect([1])
        .get(`.${SELECTED_CLASS}`)
        .should('have.length', 1)
        .getSelectContainer()
        .dispatch('mousedown', 'topLeft', { button: 0, force: true })
        .dispatch('mouseup', 'topLeft', { force: true })
        .shouldSelect([])
        .get(`.${SELECTED_CLASS}`)
        .should('have.length', 0);
    });
  });

  describe('Select on Mouseup', () => {
    beforeEach(() => {
      disableSelectOnDrag();
    });

    it.only('should select single item on mousedown', () => {
      getDesktopExample().within(() => {
        cy.getSelectItem(0)
          .dispatch('mousedown', { button: 0 })
          .dispatch('mouseup')
          .shouldSelect([1]);
      });
    });
  });
});
