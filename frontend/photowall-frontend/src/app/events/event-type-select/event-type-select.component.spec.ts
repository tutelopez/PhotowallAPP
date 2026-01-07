import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventTypeSelectComponent } from './event-type-select.component';

describe('EventTypeSelectComponent', () => {
  let component: EventTypeSelectComponent;
  let fixture: ComponentFixture<EventTypeSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventTypeSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventTypeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
