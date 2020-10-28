import { DEFAULT_CONFIG } from '../../projects/ngx-drag-to-select/src/lib/config';

import {
  disableRangeSelection,
  disableSelectOnDrag,
  enableSelectWithShortcut,
  getDesktopExample,
  toggleItem,
} from '../support/utils';

const SELECTED_CLASS = DEFAULT_CONFIG.selectedClass;

describe('Clicking', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Range Selection', () => {
    describe('Disabled', () => {
      it('should reset range selection after disabling this feature', () => {
        getDesktopExample().within(() => {
          cy.getSelectItem(0)
            .dispatch('mousedown', { button: 0 })
            .dispatch('mouseup')
            .should('have.class', 'dts-range-start');

          disableRangeSelection();

          cy.getSelectItem(2)
            .dispatch('mousedown', { button: 0 })
            .dispatch('mouseup')
            .should('not.have.class', 'dts-range-start');

          cy.getSelectItem(0).should('not.have.class', 'dts-range-start');
        });
      });

      it('should disable range selection', () => {
        getDesktopExample().within(() => {
          disableRangeSelection();

          cy.getSelectItem(2)
            .dispatch('mousedown', { button: 0 })
            .dispatch('mouseup')
            .getSelectItem(6)
            .dispatch('mousedown', { button: 0, shiftKey: true })
            .dispatch('mouseup')
            .shouldSelect([3])
            .get(`.${SELECTED_CLASS}`)
            .should('have.length', 1);
        });
      });
    });

    it('should select items in a row if shift is pressed', () => {
      getDesktopExample().within(() => {
        cy.getSelectItem(0)
          .dispatch('mousedown', { button: 0 })
          .dispatch('mouseup')
          .getSelectItem(6)
          .dispatch('mousedown', { button: 0, shiftKey: true })
          .dispatch('mouseup')
          .shouldSelect([1, 2, 3, 4, 5, 6, 7])
          .get(`.${SELECTED_CLASS}`)
          .should('have.length', 7);
      });
    });

    it('should move range start without selecting the item', () => {
      getDesktopExample().within(() => {
        cy.getSelectItem(1)
          .dispatch('keydown', { code: 'KeyR' })
          .dispatch('mousedown', { button: 0, shiftKey: true })
          .dispatch('mouseup')
          .dispatch('keyup')
          .should('have.class', 'dts-range-start')
          .shouldSelect([])
          .get(`.${SELECTED_CLASS}`)
          .should('have.length', 0);

        cy.getSelectItem(5)
          .dispatch('keydown', { code: 'KeyR' })
          .dispatch('mousedown', { button: 0, shiftKey: true })
          .dispatch('mouseup')
          .dispatch('keyup')
          .should('have.class', 'dts-range-start');
      });
    });

    it('should allow multiple consecutive range selections', () => {
      getDesktopExample().within(() => {
        cy.getSelectItem(1)
          .dispatch('mousedown', { button: 0 })
          .dispatch('mouseup')
          .getSelectItem(2)
          .dispatch('mousedown', { button: 0, shiftKey: true })
          .dispatch('mouseup')
          .shouldSelect([2, 3]);

        cy.getSelectItem(6)
          .then(toggleItem)
          .getSelectItem(10)
          .dispatch('mousedown', { button: 0, shiftKey: true })
          .dispatch('mouseup')
          .shouldSelect([2, 3, 7, 8, 9, 10, 11]);

        cy.getSelectItem(4)
          .dispatch('mousedown', { button: 0, shiftKey: true })
          .dispatch('mouseup')
          .shouldSelect([2, 3, 5, 6, 7]);
      });
    });

    it('should reset range start when item is toggled', () => {
      getDesktopExample().within(() => {
        cy.getSelectItem(0).as('start').dispatch('mousedown', { button: 0 }).dispatch('mouseup');

        cy.get('@start').should('have.class', 'dts-range-start');

        cy.getSelectItem(2)
          .dispatch('mousedown', { button: 0, shiftKey: true })
          .dispatch('mouseup')
          .getSelectItem(6)
          .as('end')
          .then(toggleItem);

        cy.get('@end').should('have.class', 'dts-range-start');
      });
    });

    it('should reset range start to be the first item of selection', () => {
      getDesktopExample().within(() => {
        cy.getSelectItem(0)
          .as('start')
          .dispatch('mousedown', { button: 0 })
          .dispatch('mouseup')
          .getSelectItem(5)
          .dispatch('mousedown', { button: 0, shiftKey: true })
          .dispatch('mouseup');

        cy.getSelectContainer()
          .dispatch('mousedown', 'top', { button: 0 })
          .getSelectItem(7)
          .dispatch('mousemove')
          .dispatch('mouseup');

        cy.getSelectItem(0).should('not.have.class', 'dts-range-start');
        cy.getSelectItem(2).should('have.class', 'dts-range-start');
      });
    });
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

    it('should select single item on mousedown', () => {
      getDesktopExample().within(() => {
        cy.getSelectItem(0).dispatch('mousedown', { button: 0 }).dispatch('mouseup').shouldSelect([1]);
      });
    });
  });
});
