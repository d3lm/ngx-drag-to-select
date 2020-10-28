import { DEFAULT_CONFIG } from '../../projects/ngx-drag-to-select/src/lib/config';

import {
  addItem,
  clearSelection,
  deleteItems,
  getMobileExample,
  getSelectCount,
  selectAll,
  shouldBeInSelectMode,
  shouldBeInvisible,
} from '../support/utils';

const SELECTED_CLASS = DEFAULT_CONFIG.selectedClass;

describe('Mobile', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should apply custom class and not apply default styles', () => {
    getMobileExample().within(() => {
      cy.get('.dts-custom')
        .should('have.length', 1)
        .getSelectItem(0)
        .as('end')
        .dispatch('mousedown', { button: 0 })
        .then(($element) => {
          expect($element.css('box-shadow')).to.eq('none');
          expect($element.css('border-width')).to.eq('0px');
        })
        .get('@end')
        .dispatch('mouseup');
    });
  });

  it('should not select items while dragging', () => {
    getMobileExample().within(() => {
      cy.getSelectItem(0)
        .dispatch('mousedown', { button: 0 })
        .getSelectItem(4)
        .dispatch('mousemove', 'bottomRight', { force: true })
        .getSelectBox()
        .then(shouldBeInvisible)
        .then(getSelectCount)
        .should('contain', 1)
        .get(`.${SELECTED_CLASS}`)
        .should('have.length', 1);
    });
  });

  it('should select multiple items on click', () => {
    getMobileExample().within(() => {
      cy.getSelectItem(0)
        .dispatch('mousedown', { button: 0 })
        .dispatch('mouseup')
        .getSelectItem(1)
        .dispatch('mousedown', { button: 0 })
        .dispatch('mouseup')
        .getSelectItem(4)
        .dispatch('mousedown', { button: 0 })
        .dispatch('mouseup')
        .then(getSelectCount)
        .should('contain', 3)
        .get(`.${SELECTED_CLASS}`)
        .should('have.length', 3);
    });
  });

  it('should enter select mode when first item is selected', () => {
    getMobileExample().within(() => {
      cy.then(shouldBeInSelectMode(false))
        .getSelectItem(0)
        .dispatch('mousedown', { button: 0 })
        .dispatch('mouseup')
        .then(shouldBeInSelectMode());
    });
  });

  it('should leave select mode no item is selected', () => {
    getMobileExample().within(() => {
      cy.getSelectItem(0)
        .as('item')
        .dispatch('mousedown', { button: 0 })
        .dispatch('mouseup')
        .then(shouldBeInSelectMode())
        .get('@item')
        .dispatch('mousedown', { button: 0 })
        .dispatch('mouseup')
        .then(shouldBeInSelectMode(false));
    });
  });

  it('should select all', () => {
    getMobileExample().within(() => {
      cy.getSelectItem(0)
        .dispatch('mousedown', { button: 0 })
        .dispatch('mouseup')
        .then(selectAll)
        .then(getSelectCount)
        .should('contain', 12)
        .get(`.${SELECTED_CLASS}`)
        .should('have.length', 12);
    });
  });

  it('should delete all items', () => {
    getMobileExample().within(() => {
      cy.getSelectItem(0)
        .dispatch('mousedown', { button: 0 })
        .dispatch('mouseup')
        .then(selectAll)
        .then(deleteItems)
        .get('.no-contacts')
        .should('be.visible')
        .get('.dts-select-item')
        .should('have.length', 0);
    });
  });

  it('should add one item', () => {
    getMobileExample().within(() => {
      cy.then(addItem)
        .get('.dts-select-item')
        .should('have.length', 13)
        .getSelectItem(12)
        .dispatch('mousedown', { button: 0 })
        .dispatch('mouseup')
        .then(getSelectCount)
        .should('contain', 1)
        .get(`.${SELECTED_CLASS}`)
        .should('have.length', 1);
    });
  });

  it('should cancel selection', () => {
    getMobileExample().within(() => {
      cy.getSelectItem(0)
        .dispatch('mousedown', { button: 0 })
        .dispatch('mouseup')
        .getSelectItem(2)
        .dispatch('mousedown', { button: 0 })
        .dispatch('mouseup')
        .then(getSelectCount)
        .as('selectCount')
        .should('contain', 2)
        .then(clearSelection)
        .get('@selectCount')
        .should('not.be.visible');
    });
  });
});
