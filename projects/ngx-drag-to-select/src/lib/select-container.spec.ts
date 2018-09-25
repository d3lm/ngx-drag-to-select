import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
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

interface SelectItemValue {
  id: number;
}

@Component({
  template: `
    <dts-select-container [(selectedItems)]="selectedItems"
      (itemSelected)="itemSelected($event)" (itemDeselected)="itemDeselected($event)"
      #selectContainer>
      <span [dtsSelectItem]="{ id: 1 }" #selectItem="dtsSelectItem">Item #1</span>
      <span [dtsSelectItem]="{ id: 2 }" #selectItem="dtsSelectItem">Item #2</span>
      <span [dtsSelectItem]="{ id: 3 }" #selectItem="dtsSelectItem">Item #3</span>
    </dts-select-container>
  `
})
class TestComponent {
  @ViewChild('selectContainer')
  selectContainer: SelectContainerComponent;

  @ViewChildren('selectItem')
  selectItems: QueryList<SelectItemDirective>;

  selectedItems = [];

  itemSelected(value: any) {}
  itemDeselected(value: any) {}
}

describe('SelectContainerComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let testComponent: TestComponent;
  let selectContainerInstance: SelectContainerComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [DragToSelectModule.forRoot()]
    }).compileComponents();
  }));

  beforeEach(() => {
    window.getSelection = jest.fn().mockReturnValue({});
    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    selectContainerInstance = fixture.componentInstance.selectContainer;
    fixture.detectChanges();
  });

  it('should not throw when clicking the element immediately on creation', () => {
    const selectContainer = fixture.debugElement.query(By.directive(SelectContainerComponent));
    expect(() => triggerDomEvent('mousedown', selectContainer.nativeElement)).not.toThrowError();
  });

  it('should expose update as part of the public api', () => {
    const selectContainer = fixture.debugElement.query(By.directive(SelectContainerComponent));

    jest.spyOn(selectContainer.componentInstance, '_calculateBoundingClientRect');
    jest.spyOn(fixture.componentInstance.selectItems.first, 'calculateBoundingClientRect');

    selectContainer.componentInstance.update();

    expect(selectContainer.componentInstance._calculateBoundingClientRect).toHaveBeenCalled();
    expect(fixture.componentInstance.selectItems.first.calculateBoundingClientRect).toHaveBeenCalled();
  });

  describe('selectItems()', () => {
    it('should select items', done => {
      const ids = [1, 2];
      const result = [{ id: 1 }, { id: 2 }];

      selectContainerInstance.select.subscribe(items => {
        expect(testComponent.selectedItems.length).toBe(result.length);
        expect(items).toEqual(result);
        expect(testComponent.selectedItems).toEqual(result);
        done();
      });

      selectContainerInstance.selectItems((item: SelectItemValue) => ids.includes(item.id));
    });

    it('should not throw error when selecting items that do not exist', done => {
      const result = [];

      selectContainerInstance.select.subscribe(items => {
        expect(testComponent.selectedItems.length).toBe(result.length);
        expect(items).toEqual(result);
        expect(testComponent.selectedItems).toEqual(result);
        done();
      });

      selectContainerInstance.selectItems((item: SelectItemValue) => item.id === -1);
      selectContainerInstance.selectItems((item: SelectItemValue) => item.id === 100);
    });
  });

  describe('deselectItems()', () => {
    beforeEach(() => {
      selectContainerInstance.selectItems((item: SelectItemValue) => true);
    });

    it('should deselect items', done => {
      const result = [{ id: 1 }];

      selectContainerInstance.select.subscribe(items => {
        expect(testComponent.selectedItems.length).toBe(result.length);
        expect(items).toEqual(result);
        expect(testComponent.selectedItems).toEqual(result);
        done();
      });

      selectContainerInstance.deselectItems((item: SelectItemValue) => [2, 3].includes(item.id));
    });

    it('should not throw error when deselecting items that do not exist', done => {
      const result = [{ id: 1 }, { id: 2 }, { id: 3 }];

      selectContainerInstance.select.subscribe(items => {
        expect(testComponent.selectedItems.length).toBe(result.length);
        expect(items).toEqual(result);
        expect(testComponent.selectedItems).toEqual(result);
        done();
      });

      selectContainerInstance.deselectItems((item: SelectItemValue) => item.id === -1);
      selectContainerInstance.deselectItems((item: SelectItemValue) => item.id === 100);
    });
  });

  describe('toggleItems()', () => {
    it('should select non-selected items', done => {
      const result = [{ id: 1 }, { id: 2 }];

      selectContainerInstance.select.subscribe(items => {
        expect(testComponent.selectedItems.length).toBe(result.length);
        expect(items).toEqual(result);
        expect(testComponent.selectedItems).toEqual(result);
        done();
      });

      selectContainerInstance.toggleItems((item: SelectItemValue) => [1, 2].includes(item.id));
    });

    it('should deselect selected items', done => {
      const result = [{ id: 2 }];

      selectContainerInstance.select.subscribe(items => {
        expect(testComponent.selectedItems.length).toBe(result.length);
        expect(items).toEqual(result);
        expect(testComponent.selectedItems).toEqual(result);
        done();
      });

      selectContainerInstance.selectItems((item: SelectItemValue) => [1, 2].includes(item.id));
      selectContainerInstance.toggleItems((item: SelectItemValue) => item.id === 1);
    });

    it('should not throw error when toggling items that do not exist', done => {
      const result = [];

      selectContainerInstance.select.subscribe(items => {
        expect(testComponent.selectedItems.length).toBe(result.length);
        expect(items).toEqual(result);
        expect(testComponent.selectedItems).toEqual(result);
        done();
      });

      selectContainerInstance.toggleItems((item: SelectItemValue) => [-1, 100].includes(item.id));
    });
  });

  describe('Outputs', () => {
    it('should trigger itemSelected', () => {
      jest.spyOn(testComponent, 'itemSelected');

      testComponent.selectContainer.selectItems(() => true);

      expect(testComponent.itemSelected).toHaveBeenCalledTimes(3);
      expect(testComponent.itemSelected).toHaveBeenCalledWith({ id: 1 });
      expect(testComponent.itemSelected).toHaveBeenCalledWith({ id: 2 });
      expect(testComponent.itemSelected).toHaveBeenCalledWith({ id: 3 });
    });

    it('should trigger itemDeselected', () => {
      jest.spyOn(testComponent, 'itemDeselected');

      testComponent.selectContainer.selectItems(() => true);
      testComponent.selectContainer.deselectItems((item: SelectItemValue) => item.id === 2);

      expect(testComponent.itemDeselected).toHaveBeenCalledTimes(1);
      expect(testComponent.itemDeselected).toHaveBeenCalledWith({ id: 2 });
    });
  });
});
