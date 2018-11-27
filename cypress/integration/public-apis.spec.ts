import { DEFAULT_CONFIG } from '../../projects/ngx-drag-to-select/src/lib/config';
import { clearSelection, getDesktopExample, selectAll } from '../support/utils';

const SELECTED_CLASS = DEFAULT_CONFIG.selectedClass;

describe('Public APIs', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should select all items', () => {
    getDesktopExample().within(() => {
      selectAll();

      cy.shouldSelect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
        .get(`.${SELECTED_CLASS}`)
        .should('have.length', 12);
    });
  });

  it('should clear selection', () => {
    getDesktopExample().within(() => {
      selectAll();
      clearSelection();

      cy.shouldSelect([])
        .get(`.${SELECTED_CLASS}`)
        .should('have.length', 0);
    });
  });
});
