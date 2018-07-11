import {
  shouldBeInvisible,
  shouldBeVisible,
  getDesktopExample,
  disableSelectOnDrag,
  toggleItem,
  disableSelection,
  selectAll,
  clearSelection,
  enableSelectMode,
  getMobileExample,
  deleteItems,
  addItem,
  getAddButton,
  getClearButton,
  getDeleteButton,
  getSelectAllButton,
  shouldBeInSelectMode,
  getSelectCount,
  enableSelectWithShortcut
} from '../support/utils';

import { NO_SELECT_CLASS } from '../../src/lib/src/constants';
import { DEFAULT_CONFIG } from '../../src/lib/src/config';

const SELECTED_CLASS = DEFAULT_CONFIG.selectedClass;

describe('Desktop', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('body').as('body');
  });

  describe('Styling and Classes', () => {
    it(`should add class '${NO_SELECT_CLASS}' to body on mousedown`, () => {
      getDesktopExample().within(() => {
        cy.getSelectItem(0)
          .dispatch('mousedown')
          .get('@body')
          .should('have.class', NO_SELECT_CLASS);
      });
    });

    it(`should remove class '${NO_SELECT_CLASS}' from body on mouseup`, () => {
      getDesktopExample().within(() => {
        cy.getSelectItem(0)
          .as('start')
          .dispatch('mousedown')
          .get('@body')
          .should('have.class', NO_SELECT_CLASS)
          .get('@start')
          .dispatch('mouseup')
          .get('@body')
          .should('not.have.class', NO_SELECT_CLASS);
      });
    });

    it(`should add '${SELECTED_CLASS}' class to selected elements`, () => {
      getDesktopExample().within(() => {
        cy.getSelectItem(0)
          .dispatch('mousedown')
          .dispatch('mouseup')
          .should('have.class', SELECTED_CLASS);

        cy.getSelectItem(0)
          .dispatch('mousedown')
          .getSelectItem(2)
          .dispatch('mousemove', 'bottomRight', { force: true })
          .dispatch('mouseup')
          .get(`.${SELECTED_CLASS}`)
          .should('have.length', 3);
      });
    });

    it('should apply default styles', () => {
      getDesktopExample().within(() => {
        cy.getSelectItem(0)
          .dispatch('mousedown')
          .dispatch('mouseup')
          .then($element => {
            expect($element.css('box-shadow')).not.to.eq('none');
            expect($element.css('border')).to.eq('1px solid rgb(210, 210, 210)');
          });
      });
    });
  });

  describe('Public APIs', () => {
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

  describe('Clicking', () => {
    it('should select single item on mousedown', () => {
      getDesktopExample().within(() => {
        cy.getSelectItem(0)
          .dispatch('mousedown')
          .dispatch('mouseup')
          .shouldSelect([1])
          .get(`.${SELECTED_CLASS}`)
          .should('have.length', 1)
          .getSelectItem(1)
          .dispatch('mousedown')
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
          .dispatch('mousedown')
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
          .dispatch('mousedown')
          .dispatch('mouseup')
          .shouldSelect([1])
          .get(`.${SELECTED_CLASS}`)
          .should('have.length', 1)
          .get('@end')
          .dispatch('mousedown', mousePosition)
          .dispatch('mouseup', mousePosition)
          .shouldSelect([1])
          .get(`.${SELECTED_CLASS}`)
          .should('have.length', 1);
      });
    });

    it('should clear selected item when clicked inside draggable area', () => {
      getDesktopExample().within(() => {
        cy.getSelectItem(0)
          .dispatch('mousedown')
          .dispatch('mouseup')
          .shouldSelect([1])
          .get(`.${SELECTED_CLASS}`)
          .should('have.length', 1)
          .getSelectContainer()
          .dispatch('mousedown', 'topLeft', { force: true })
          .dispatch('mouseup', 'topLeft', { force: true })
          .shouldSelect([])
          .get(`.${SELECTED_CLASS}`)
          .should('have.length', 0);
      });
    });
  });

  describe('Dragging', () => {
    describe('Select on Drag', () => {
      it('should not start dragging if mouse is outside of draggable area', () => {
        cy.get('body')
          .dispatch('mousedown', 'topLeft')
          .then(getDesktopExample)
          .within(() => {
            cy.getSelectItem(6, 'end')
              .dispatch('mousemove')
              .shouldSelect([])
              .getSelectBox()
              .then(shouldBeInvisible)
              .get('@end')
              .dispatch('mouseup');
          });
      });

      it('should start new selection', () => {
        getDesktopExample().within(() => {
          cy.getSelectItem(2)
            .dispatch('mousedown')
            .getSelectItem(7)
            .dispatch('mousemove')
            .dispatch('mouseup')
            .shouldSelect([3, 4, 7, 8])
            .getSelectItem(0)
            .dispatch('mousedown')
            .getSelectItem(1)
            .dispatch('mousemove', 'bottomRight', { force: true })
            .dispatch('mouseup')
            .shouldSelect([1, 2]);
        });
      });

      it('should select items when select box is positive', () => {
        getDesktopExample().within(() => {
          cy.getSelectItem(0)
            .dispatch('mousedown')
            .getSelectItem(6, 'end')
            .dispatch('mousemove')
            .shouldSelect([1, 2, 3, 5, 6, 7])
            .getSelectBox()
            .then(shouldBeVisible)
            .get('@end')
            .dispatch('mouseup');
        });
      });

      it('should select items when select box is negative', () => {
        getDesktopExample().within(() => {
          cy.getSelectItem(7)
            .dispatch('mousedown')
            .getSelectItem(1, 'end')
            .dispatch('mousemove')
            .shouldSelect([2, 3, 4, 6, 7, 8])
            .getSelectBox()
            .then(shouldBeVisible)
            .get('@end')
            .dispatch('mouseup');
        });
      });

      it('should select items if cursor goes outside of select container', () => {
        getDesktopExample().within(() => {
          cy.getSelectItem(0)
            .as('end')
            .dispatch('mousedown')
            .dispatch('mousemove', { clientX: 900, clientY: -100 })
            .shouldSelect([1, 2, 3, 4])
            .getSelectBox()
            .then(shouldBeVisible)
            .get('@end')
            .dispatch('mouseup');
        });
      });
    });

    describe('Select on Mouseup', () => {
      beforeEach(() => {
        disableSelectOnDrag();
      });

      it('should not select items while dragging', () => {
        getDesktopExample().within(() => {
          cy.getSelectItem(0)
            .dispatch('mousedown')
            .getSelectItem(6, 'end')
            .dispatch('mousemove')
            .shouldSelect([1])
            .getSelectBox()
            .then(shouldBeVisible);
        });
      });

      it('should select items only after mouseup', () => {
        getDesktopExample().within(() => {
          cy.getSelectItem(0)
            .dispatch('mousedown')
            .getSelectItem(6, 'end')
            .dispatch('mousemove')
            .shouldSelect([1])
            .getSelectBox()
            .then(shouldBeVisible)
            .get('@end')
            .dispatch('mouseup')
            .shouldSelect([1, 2, 3, 5, 6, 7]);
        });
      });

      it('should not select items when mouse leaves draggable container', () => {
        const mousePosition = { clientX: 850, clientY: -310 };

        getDesktopExample().within(() => {
          cy.getSelectItem(5)
            .as('end')
            .dispatch('mousedown')
            .dispatch('mousemove', mousePosition)
            .shouldSelect([6])
            .get('@end')
            .dispatch('mouseup', mousePosition)
            .shouldSelect([6])
            .get(`.${SELECTED_CLASS}`)
            .should('have.length', 1);
        });
      });
    });

    describe('Disabled', () => {
      beforeEach(() => {
        disableSelection();
      });

      it('should not select item on mousedown', () => {
        getDesktopExample().within(() => {
          cy.getSelectItem(0)
            .as('end')
            .dispatch('mousedown')
            .shouldSelect([])
            .get(`.${SELECTED_CLASS}`)
            .should('have.length', 0)
            .getSelectBox()
            .then(shouldBeInvisible)
            .get('@end')
            .dispatch('mouseup');
        });
      });

      it('should not select item while dragging', () => {
        getDesktopExample().within(() => {
          cy.getSelectItem(0)
            .dispatch('mousedown')
            .getSelectItem(2)
            .as('end')
            .dispatch('mousemove')
            .shouldSelect([])
            .get(`.${SELECTED_CLASS}`)
            .should('have.length', 0)
            .getSelectBox()
            .then(shouldBeInvisible)
            .get('@end')
            .dispatch('mouseup');
        });
      });

      it('should not select item on mouseup', () => {
        getDesktopExample().within(() => {
          cy.getSelectItem(0)
            .dispatch('mousedown')
            .getSelectItem(2)
            .as('end')
            .dispatch('mousemove')
            .get('@end')
            .dispatch('mouseup')
            .get(`.${SELECTED_CLASS}`)
            .should('have.length', 0)
            .getSelectBox()
            .then(shouldBeInvisible);
        });
      });
    });

    describe('Select Mode', () => {
      beforeEach(() => {
        enableSelectMode();
        disableSelectOnDrag();
      });

      it('should toggle single items', () => {
        getDesktopExample().within(() => {
          cy.getSelectItem(0)
            .dispatch('mousedown')
            .dispatch('mouseup')
            .getSelectItem(1)
            .dispatch('mousedown')
            .dispatch('mouseup')
            .getSelectItem(2)
            .dispatch('mousedown')
            .dispatch('mouseup')
            .shouldSelect([1, 2, 3])
            .get(`.${SELECTED_CLASS}`)
            .should('have.length', 3)
            .getSelectItem(1)
            .dispatch('mousedown')
            .dispatch('mouseup')
            .shouldSelect([1, 3])
            .get(`.${SELECTED_CLASS}`)
            .should('have.length', 2);
        });
      });

      it('should now allow dragging', () => {
        getDesktopExample().within(() => {
          cy.getSelectItem(0)
            .dispatch('mousedown')
            .getSelectItem(6)
            .as('end')
            .dispatch('mousemove')
            .getSelectBox()
            .then(shouldBeInvisible)
            .get('@end')
            .dispatch('mouseup')
            .shouldSelect([1])
            .get(`.${SELECTED_CLASS}`)
            .should('have.length', 1);
        });
      });
    });

    describe('Shortcuts', () => {
      it('should toggle single items', () => {
        getDesktopExample().within(() => {
          cy.getSelectItem(0)
            .then(toggleItem)
            .shouldSelect([1])
            .getSelectItem(1)
            .then(toggleItem)
            .shouldSelect([1, 2])
            .getSelectItem(0)
            .then(toggleItem)
            .shouldSelect([2])
            .getSelectItem(1)
            .then(toggleItem)
            .shouldSelect([]);
        });
      });

      it('should extend selection after mouseup', () => {
        getDesktopExample().within(() => {
          cy.getSelectItem(0)
            .dispatch('mousedown')
            .getSelectItem(5)
            .dispatch('mousemove')
            .dispatch('mouseup')
            .shouldSelect([1, 2, 5, 6])
            .getSelectItem(2)
            .dispatch('mousedown', { shiftKey: true })
            .getSelectItem(7)
            .as('end')
            .dispatch('mousemove', { shiftKey: true })
            .shouldSelect([1, 2, 5, 6])
            .get(`.${SELECTED_CLASS}`)
            .should('have.length', 8)
            .get('@end')
            .dispatch('mouseup')
            .shouldSelect([1, 2, 3, 4, 5, 6, 7, 8])
            .get(`.${SELECTED_CLASS}`)
            .should('have.length', 8);
        });
      });

      it('should remove items from selection after mouseup', () => {
        getDesktopExample().within(() => {
          cy.getSelectItem(0)
            .dispatch('mousedown')
            .getSelectItem(5)
            .as('removeStart')
            .dispatch('mousemove')
            .dispatch('mouseup')
            .shouldSelect([1, 2, 5, 6])
            .get('@removeStart')
            .dispatch('mousedown', 'bottomRight', { force: true, shiftKey: true, ctrlKey: true, metaKey: true })
            .shouldSelect([1, 2, 5, 6])
            .getSelectItem(1)
            .as('end')
            .dispatch('mousemove', { shiftKey: true, ctrlKey: true, metaKey: true })
            .shouldSelect([1, 2, 5, 6])
            .get(`.${SELECTED_CLASS}`)
            .should('have.length', 2)
            .get('@end')
            .dispatch('mouseup')
            .shouldSelect([1, 5])
            .get(`.${SELECTED_CLASS}`)
            .should('have.length', 2);
        });
      });

      it('should disable selection', () => {
        getDesktopExample().within(() => {
          cy.getSelectItem(0)
            .dispatch('mousedown', { altKey: true })
            .getSelectItem(11)
            .as('end')
            .dispatch('mousemove')
            .getSelectBox()
            .then(shouldBeInvisible)
            .shouldSelect([])
            .get(`.${SELECTED_CLASS}`)
            .should('have.length', 0)
            .get('@end')
            .dispatch('mouseup');
        });
      });
    });
  });
});

describe('Mobile', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should apply custom class and not apply default styles', () => {
    getMobileExample().within(() => {
      cy.get('.ngx-custom')
        .should('have.length', 1)
        .getSelectItem(0)
        .as('end')
        .dispatch('mousedown')
        .then($element => {
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
        .dispatch('mousedown')
        .getSelectItem(4)
        .dispatch('mousemove', 'bottomRight', { force: true })
        .getSelectBox()
        .then(shouldBeInvisible)
        .get('.select-count')
        .should('contain', 1)
        .get(`.${SELECTED_CLASS}`)
        .should('have.length', 1);
    });
  });

  it('should select multiple items on click', () => {
    getMobileExample().within(() => {
      cy.getSelectItem(0)
        .dispatch('mousedown')
        .dispatch('mouseup')
        .getSelectItem(1)
        .dispatch('mousedown')
        .dispatch('mouseup')
        .getSelectItem(4)
        .dispatch('mousedown')
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
        .dispatch('mousedown')
        .dispatch('mouseup')
        .then(shouldBeInSelectMode());
    });
  });

  it('should leave select mode no item is selected', () => {
    getMobileExample().within(() => {
      cy.getSelectItem(0)
        .as('item')
        .dispatch('mousedown')
        .dispatch('mouseup')
        .then(shouldBeInSelectMode())
        .get('@item')
        .dispatch('mousedown')
        .dispatch('mouseup')
        .then(shouldBeInSelectMode(false));
    });
  });

  it('should select all', () => {
    getMobileExample().within(() => {
      cy.getSelectItem(0)
        .dispatch('mousedown')
        .dispatch('mouseup')
        .then(selectAll)
        .get('.select-count')
        .should('contain', 12)
        .get(`.${SELECTED_CLASS}`)
        .should('have.length', 12);
    });
  });

  it('should delete all items', () => {
    getMobileExample().within(() => {
      cy.getSelectItem(0)
        .dispatch('mousedown')
        .dispatch('mouseup')
        .then(selectAll)
        .then(deleteItems)
        .get('.no-contacts')
        .should('be.visible')
        .get('.ngx-select-item')
        .should('have.length', 0);
    });
  });

  it('should add one item', () => {
    getMobileExample().within(() => {
      cy.then(addItem)
        .get('.ngx-select-item')
        .should('have.length', 13)
        .getSelectItem(12)
        .dispatch('mousedown')
        .dispatch('mouseup')
        .get('.select-count')
        .should('contain', 1)
        .get(`.${SELECTED_CLASS}`)
        .should('have.length', 1);
    });
  });
});
