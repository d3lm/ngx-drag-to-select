import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DragToSelectModule } from './drag-to-select.module';
import { SelectContainerComponent } from './select-container.component';
import { SelectItemDirective } from './select-item.directive';
import { BehaviorSubject } from 'rxjs';

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
    <dts-select-container
      [(selectedItems)]="selectedItems"
      (itemSelected)="itemSelected($event)"
      (itemDeselected)="itemDeselected($event)"
      #selectContainer
    >
      <ng-container *ngIf="data$ | async as data">
        <span *ngFor="let item of data" [dtsSelectItem]="item" #selectItem="dtsSelectItem">Item #{{ item.id }}</span>
      </ng-container>
    </dts-select-container>
  `,
})
class TestComponent {
  @ViewChild('selectContainer', { static: true })
  selectContainer: SelectContainerComponent;

  @ViewChildren('selectItem')
  selectItems: QueryList<SelectItemDirective>;

  selectedItems = [];

  data$ = new BehaviorSubject<SelectItemValue[]>([{ id: 1 }, { id: 2 }, { id: 3 }]);

  itemSelected(value: any) {}
  itemDeselected(value: any) {}

  getByIndex(index: number) {
    return this.selectItems.find((_, i) => i === index);
  }
}

describe('SelectContainerComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let testComponent: TestComponent;
  let selectContainerInstance: SelectContainerComponent;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [DragToSelectModule.forRoot()],
      }).compileComponents();
    })
  );

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

  it('should update its selection when selectable items change', (done) => {
    selectContainerInstance.selectItems((item: SelectItemValue) => item.id === 1 || item.id === 2);

    selectContainerInstance.itemDeselected.subscribe((item: SelectItemValue) => {
      expect(item).toEqual({ id: 1 });
    });

    selectContainerInstance.select.subscribe((items) => {
      expect(items).toEqual([{ id: 2 }]);
      done();
    });

    const previousData = testComponent.data$.value;

    testComponent.data$.next([previousData[1], previousData[2], { id: 4 }]);

    fixture.detectChanges();
  });

  describe('selectItems()', () => {
    it('should select items', (done) => {
      const ids = [1, 2];
      const result = [{ id: 1 }, { id: 2 }];

      selectContainerInstance.select.subscribe((items) => {
        expect(testComponent.selectedItems.length).toBe(result.length);
        expect(items).toEqual(result);
        expect(testComponent.selectedItems).toEqual(result);
        done();
      });

      selectContainerInstance.selectItems((item: SelectItemValue) => ids.includes(item.id));
    });

    it('should not throw error when selecting items that do not exist', (done) => {
      const result = [];

      selectContainerInstance.select.subscribe((items) => {
        expect(testComponent.selectedItems.length).toBe(result.length);
        expect(items).toEqual(result);
        expect(testComponent.selectedItems).toEqual(result);
        done();
      });

      selectContainerInstance.selectItems((item: SelectItemValue) => item.id === -1);
      selectContainerInstance.selectItems((item: SelectItemValue) => item.id === 100);
    });

    it('should not select disabled item', (done) => {
      const ids = [1, 3];
      const result = [{ id: 1 }, { id: 3 }];

      selectContainerInstance.select.subscribe((items) => {
        expect(testComponent.selectedItems.length).toBe(result.length);
        expect(items).toEqual(result);
        expect(testComponent.selectedItems).toEqual(result);
        done();
      });

      testComponent.getByIndex(1).dtsDisabled = true;

      selectContainerInstance.selectAll();
    });
  });

  describe('deselectItems()', () => {
    beforeEach(() => {
      selectContainerInstance.selectItems((item: SelectItemValue) => true);
    });

    it('should deselect items', (done) => {
      const result = [{ id: 1 }];

      selectContainerInstance.select.subscribe((items) => {
        expect(testComponent.selectedItems.length).toBe(result.length);
        expect(items).toEqual(result);
        expect(testComponent.selectedItems).toEqual(result);
        done();
      });

      selectContainerInstance.deselectItems((item: SelectItemValue) => [2, 3].includes(item.id));
    });

    it('should not throw error when deselecting items that do not exist', (done) => {
      const result = [{ id: 1 }, { id: 2 }, { id: 3 }];

      selectContainerInstance.select.subscribe((items) => {
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
    it('should select non-selected items', (done) => {
      const result = [{ id: 1 }, { id: 2 }];

      selectContainerInstance.select.subscribe((items) => {
        expect(testComponent.selectedItems.length).toBe(result.length);
        expect(items).toEqual(result);
        expect(testComponent.selectedItems).toEqual(result);
        done();
      });

      selectContainerInstance.toggleItems((item: SelectItemValue) => [1, 2].includes(item.id));
    });

    it('should deselect selected items', (done) => {
      const result = [{ id: 2 }];

      selectContainerInstance.select.subscribe((items) => {
        expect(testComponent.selectedItems.length).toBe(result.length);
        expect(items).toEqual(result);
        expect(testComponent.selectedItems).toEqual(result);
        done();
      });

      selectContainerInstance.selectItems((item: SelectItemValue) => [1, 2].includes(item.id));
      selectContainerInstance.toggleItems((item: SelectItemValue) => item.id === 1);
    });

    it('should not throw error when toggling items that do not exist', (done) => {
      const result = [];

      selectContainerInstance.select.subscribe((items) => {
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
