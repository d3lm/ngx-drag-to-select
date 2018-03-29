import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getHeadline() {
    return element(by.css('ngx-root h1')).getText();
  }
}
