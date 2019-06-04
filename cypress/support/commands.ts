/**
 * This custom command is important to ensure a certain order of events, namely scroll and mouse events.
 * Calling 'trigger' scrolls the element into view which changes the bounding rect. This means that whenever
 * the user scrolls on the page, the bounding rect of each element needs to be re-calculated. In order to
 * avoid an unnecessary overhead of computation, scrolling is throttled internally meaning the
 * the re-calculation of the bounding rects is only executed every 16ms. That said, the scroll event needs to
 * be emitted first before any other mouse event. Hence, we scroll the element into view, wait for 16ms and
 * eventually trigger the mouse event.
 */
Cypress.Commands.add(
  'dispatch',
  { prevSubject: 'element' },
  (subject, event, ...args): any => {
    return cy
      .wrap(subject)
      .scrollIntoView()
      .wait(16)
      .trigger(event, ...args)
      .wait(16);
  }
);

Cypress.Commands.add(
  'shouldSelect',
  (ids: Array<number>, ...args): any => {
    const expected = ids.map(id => `Document ${id}`);

    const checkSelectedItems = (items: Cypress.ObjectLike): { success: boolean; actual: Array<string> } => {
      const actual = Array.prototype.map.call(items, (item: HTMLElement) => item.textContent || '') as Array<string>;

      const success = expected.every(expectedTextContent =>
        actual.some(actualTextContent => actualTextContent === expectedTextContent)
      );

      return {
        success,
        actual
      };
    };

    return cy
      .getSelectedItems()
      .should('have.length', ids.length)
      .then(checkSelectedItems)
      .then(result => {
        if (!result.success) {
          Cypress.log({
            message: ['Selected items do not match'],
            consoleProps: () => ({
              [`Expected: ${expected}`]: `Actual: ${result.actual}`
            })
          });
        }

        return result.success;
      })
      .should('eq', true);
  }
);

Cypress.Commands.add(
  'getSelectItem',
  (index: number, ...args): any => {
    let options: any = {};

    if (Cypress._.isObject(args[0])) {
      options = args[0];
    }

    if (Cypress._.isString(args[0])) {
      options.alias = args[0];
    }

    let selectItems = cy.get('.dts-select-item', options).eq(index);

    if (options.alias) {
      selectItems = selectItems.as(options.alias);
    }

    return selectItems;
  }
);

Cypress.Commands.add(
  'getSelectedItems',
  (options): any => {
    return cy.get('[data-cy="selected-item"]', options);
  }
);

Cypress.Commands.add(
  'getSelectBox',
  (options): any => {
    return cy.get('.dts-select-box', options);
  }
);

Cypress.Commands.add(
  'getSelectContainer',
  (options): any => {
    return cy.get('.dts-select-container', options);
  }
);

declare namespace Cypress {
  interface Chainable {
    dispatch: (event: string, ...args: any[]) => Cypress.Chainable<JQuery>;
    getSelectItem: (index: number, options?: any) => Cypress.Chainable<JQuery>;
    getSelectedItems: (options?: any) => Cypress.Chainable<JQuery>;
    getSelectBox: (options?: any) => Cypress.Chainable<JQuery>;
    getSelectContainer: (options?: any) => Cypress.Chainable<JQuery>;
    shouldSelect: (ids: number[], ...args: any[]) => Cypress.Chainable<JQuery>;
  }
}
