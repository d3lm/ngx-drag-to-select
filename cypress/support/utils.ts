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

export const getDragAndDropExample = () => {
  return cy.get('[data-cy="drag-and-drop"]');
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

export const getTodoList = () => {
  return cy.get('[data-cy="todo-list"]');
};

export const getDoingList = () => {
  return cy.get('[data-cy="doing-list"]');
};

export const getDoneList = () => {
  return cy.get('[data-cy="done-list"]');
};

export const disableSelectOnDrag = () => {
  return cy.get('[data-cy="selectOnDrag"]').click();
};

export const disableDragOverItems = () => {
  return cy.get('[data-cy="dragOverItems"]').click();
};

export const disableSelectOnClick = () => {
  return cy.get('[data-cy="selectOnClick"]').click();
};

export const disableRangeSelection = () => {
  return cy.get('[data-cy="disableRangeSelection"]').click();
};

export const disableEvenItems = () => {
  return cy.get('[data-cy="disableEvenItems"]').click();
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
  return getClearButton().click().wait(150);
};

export const toggleItem = (subject: Cypress.ObjectLike) => {
  return cy.wrap(subject).dispatch('mousedown', { button: 0, ctrlKey: true, metaKey: true }).dispatch('mouseup');
};

export const shouldBeInSelectMode = (inSelectMode: boolean = true) => {
  return () => {
    const addButtonVisibility = inSelectMode ? 'not.' : '';
    const selectModeButtonVisibility = inSelectMode ? '' : 'not.';

    return cy
      .then(getAddButton)
      .should(`${addButtonVisibility}exist`)
      .then(getClearButton)
      .should(`${selectModeButtonVisibility}exist`)
      .then(getSelectAllButton)
      .should(`${selectModeButtonVisibility}exist`)
      .then(getDeleteButton)
      .should(`${selectModeButtonVisibility}exist`);
  };
};
