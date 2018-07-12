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
  return cy.get('[cy-data="desktop"]');
};

export const getMobileExample = () => {
  return cy.get('[cy-data="mobile"]');
};

export const getSelectCount = () => {
  return cy.get('[cy-data="select-count"]');
};

export const getAddButton = () => {
  return cy.get('[cy-data="add"]');
};

export const getDeleteButton = () => {
  return cy.get('[cy-data="delete"]');
};

export const getSelectAllButton = () => {
  return cy.get('[cy-data="selectAll"]');
};

export const getClearButton = () => {
  return cy.get('[cy-data="clearSelection"]');
};

export const disableSelectOnDrag = () => {
  return cy.get('[cy-data="selectOnDrag"]').click();
};

export const enableSelectMode = () => {
  return cy.get('[cy-data="selectMode"]').click();
};

export const disableSelection = () => {
  return cy.get('[cy-data="disable"]').click();
};

export const enableSelectWithShortcut = () => {
  return cy.get('[cy-data="selectWithShortcut"]').click();
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
    .dispatch('mousedown', { ctrlKey: true, metaKey: true })
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
