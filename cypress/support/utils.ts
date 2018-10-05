export const shouldBeInvisible = (subject: Cypress.ObjectLike) => {
  return cy
    .wrap(subject)
    .as('subject')
    .invoke('height')
    .should('be.lte', 0)
    .get('@subject')
    .invoke('height')
    .should('be.lte', 0);
};

export const shouldBeVisible = (subject: Cypress.ObjectLike) => {
  return cy
    .wrap(subject)
    .as('subject')
    .invoke('height')
    .should('be.gt', 0)
    .get('@subject')
    .invoke('height')
    .should('be.gt', 0);
};

export const getDesktopExample = () => {
  return cy.get('[data-cy="desktop"]');
};

export const getMobileExample = () => {
  return cy.get('[data-cy="mobile"]');
};

export const getSelectCount = () => {
  return cy.get('[data-cy="select-count"]');
};

export const getAddButton = () => {
  return cy.get('[data-cy="add"]');
};

export const getDeleteButton = () => {
  return cy.get('[data-cy="delete"]');
};

export const getSelectAllButton = () => {
  return cy.get('[data-cy="selectAll"]');
};

export const getClearButton = () => {
  return cy.get('[data-cy="clearSelection"]');
};

export const disableSelectOnDrag = () => {
  return cy.get('[data-cy="selectOnDrag"]').click();
};

export const enableSelectMode = () => {
  return cy.get('[data-cy="selectMode"]').click();
};

export const disableSelection = () => {
  return cy.get('[data-cy="disable"]').click();
};

export const enableSelectWithShortcut = () => {
  return cy.get('[data-cy="selectWithShortcut"]').click();
};

export const selectAll = () => {
  return getSelectAllButton().click();
};

export const addItem = () => {
  return getAddButton().click();
};

export const deleteItems = () => {
  return getDeleteButton().click();
};

export const clearSelection = () => {
  return getClearButton()
    .click()
    .wait(150);
};

export const toggleItem = (subject: Cypress.ObjectLike) => {
  return cy
    .wrap(subject)
    .dispatch('mousedown', { button: 0, ctrlKey: true, metaKey: true })
    .dispatch('mouseup');
};

export const shouldBeInSelectMode = (inSelectMode: boolean = true) => {
  return () => {
    const addButtonVisibility = inSelectMode ? 'not.' : '';
    const selectModeButtonVisibility = inSelectMode ? '' : 'not.';

    return cy
      .then(getAddButton)
      .should(`${addButtonVisibility}be.visible`)
      .then(getClearButton)
      .should(`${selectModeButtonVisibility}be.visible`)
      .then(getSelectAllButton)
      .should(`${selectModeButtonVisibility}be.visible`)
      .then(getDeleteButton)
      .should(`${selectModeButtonVisibility}be.visible`);
  };
};
