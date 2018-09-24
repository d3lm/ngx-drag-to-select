import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { DragToSelectModule } from './drag-to-select.module';
import { SelectContainerComponent } from './select-container.component';
import { By } from '@angular/platform-browser';
import { SelectItemDirective } from './select-item.directive';

function triggerDomEvent(eventType: string, target: HTMLElement | Element, eventData: object = {}): void {
  const event: Event = document.createEvent('Event');
  Object.assign(event, eventData);
  event.initEvent(eventType, true, true);
  target.dispatchEvent(event);
}

@Component({
  template: `
    <dts-select-container>
      <span dtsSelectItem #selectItem="dtsSelectItem">Select me!</span>
    </dts-select-container>
  `
})
class TestComponent {
  @ViewChild('selectItem')
  selectItem: SelectItemDirective;
}

describe('SelectContainerComponent', () => {
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
    fixture.detectChanges();
  });

  it('should not throw when clicking the element immediately on creation', () => {
    const selectContainer = fixture.debugElement.query(By.directive(SelectContainerComponent));
    expect(() => triggerDomEvent('mousedown', selectContainer.nativeElement)).not.toThrowError();
  });

  it('should expose update as part of the public api', () => {
    const selectContainer = fixture.debugElement.query(By.directive(SelectContainerComponent));

    jest.spyOn(selectContainer.componentInstance, 'calculateBoundingClientRect');
    jest.spyOn(fixture.componentInstance.selectItem, 'calculateBoundingClientRect');

    selectContainer.componentInstance.update();

    expect(selectContainer.componentInstance.calculateBoundingClientRect).toHaveBeenCalled();
    expect(fixture.componentInstance.selectItem.calculateBoundingClientRect).toHaveBeenCalled();
  });
});
