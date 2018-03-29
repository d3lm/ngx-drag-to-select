import { AppPage } from './app.po';

describe('Demo App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display headline', () => {
    page.navigateTo();
    expect(page.getHeadline()).toEqual('Angular Drag-to-Select Component');
  });
});
