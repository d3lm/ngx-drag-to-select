import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { DragToSelectModule } from './drag-to-select.module';
import { SelectContainerComponent } from './select-container.component';
import { By } from '@angular/platform-browser';

function triggerDomEvent(eventType: string, target: HTMLElement | Element, eventData: object = {}): void {
  const event: Event = document.createEvent('Event');
  Object.assign(event, eventData);
  event.initEvent(eventType, true, true);
  target.dispatchEvent(event);
}

@Component({
  template: `
    <ngx-select-container>
      <span selectItem>Select me!</span>
    </ngx-select-container>
  `
})
class TestComponent {}

describe('SelectContainerComponent', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [DragToSelectModule.forRoot()]
    }).compileComponents();
  }));

  beforeEach(() => {
    window.getSelection = jest.fn().mockReturnValue({});
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not throw when clicking the element immediately on creation', () => {
    const selectContainer = fixture.debugElement.query(By.directive(SelectContainerComponent)).nativeElement;
    expect(() => triggerDomEvent('mousedown', selectContainer)).not.toThrowError();
  });
});
