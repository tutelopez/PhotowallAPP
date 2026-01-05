import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardOrganizerComponent } from './dashboard-organizer.component';

describe('DashboardOrganizerComponent', () => {
  let component: DashboardOrganizerComponent;
  let fixture: ComponentFixture<DashboardOrganizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardOrganizerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardOrganizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
