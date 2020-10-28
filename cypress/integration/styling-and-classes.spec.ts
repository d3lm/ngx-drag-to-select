import { DEFAULT_CONFIG } from '../../projects/ngx-drag-to-select/src/lib/config';
import { NO_SELECT_CLASS } from '../../projects/ngx-drag-to-select/src/lib/constants';
import { getDesktopExample } from '../support/utils';

const SELECTED_CLASS = DEFAULT_CONFIG.selectedClass;

describe('Styling and Classes', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('body').as('body');
  });

  it(`should add class '${NO_SELECT_CLASS}' to body on mousedown`, () => {
    getDesktopExample().within(() => {
      cy.getSelectItem(0).dispatch('mousedown', { button: 0 }).get('@body').should('have.class', NO_SELECT_CLASS);
    });
  });

  it(`should remove class '${NO_SELECT_CLASS}' from body on mouseup`, () => {
    getDesktopExample().within(() => {
      cy.getSelectItem(0)
        .as('start')
        .dispatch('mousedown', { button: 0 })
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
      cy.getSelectItem(0).dispatch('mousedown', { button: 0 }).dispatch('mouseup').should('have.class', SELECTED_CLASS);

      cy.getSelectItem(0)
        .dispatch('mousedown', { button: 0 })
        .getSelectItem(2)
        .dispatch('mousemove', 'bottomRight', { force: true })
        .dispatch('mouseup')
        .get(`.${SELECTED_CLASS}`)
        .should('have.length', 3);
    });
  });

  it(`should add 'dts-adding' when additively selecting items`, () => {
    getDesktopExample().within(() => {
      cy.getSelectItem(0)
        .dispatch('mousedown', { button: 0 })
        .getSelectItem(2)
        .as('end')
        .dispatch('mousemove')
        .getSelectBox()
        .should('have.class', 'dts-adding')
        .should('not.have.class', 'dts-removing')
        .get('@end')
        .dispatch('mouseup');
    });
  });

  it(`should remove 'dts-adding' on mouseup`, () => {
    getDesktopExample().within(() => {
      cy.getSelectItem(0)
        .dispatch('mousedown', { button: 0 })
        .getSelectItem(2)
        .dispatch('mousemove')
        .dispatch('mouseup')
        .getSelectBox()
        .should('not.have.class', 'dts-adding');
    });
  });

  it(`should add 'dts-removing' when deselecting items in extended mode`, () => {
    getDesktopExample().within(() => {
      cy.getSelectItem(0)
        .dispatch('mousedown', { button: 0 })
        .getSelectItem(2)
        .as('end')
        .dispatch('mousemove', { shiftKey: true, ctrlKey: true, metaKey: true })
        .getSelectBox()
        .should('have.class', 'dts-removing')
        .should('not.have.class', 'dts-adding')
        .get('@end')
        .dispatch('mouseup');
    });
  });

  it('should apply default styles', () => {
    getDesktopExample().within(() => {
      cy.getSelectItem(0)
        .dispatch('mousedown', { button: 0 })
        .dispatch('mouseup')
        .then(($element) => {
          expect($element.css('box-shadow')).not.to.eq('none');
          expect($element.css('border')).to.eq('1px solid rgb(33, 150, 243)');
        });

      cy.getSelectItem(1)
        .dispatch('mousedown', { button: 0, shiftKey: true })
        .dispatch('mouseup')
        .then(($element) => {
          expect($element.css('border')).to.eq('1px solid rgb(210, 210, 210)');
        });
    });
  });
});
