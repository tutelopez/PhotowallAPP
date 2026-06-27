import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Projection } from './projection';

describe('Projection', () => {
  let component: Projection;
  let fixture: ComponentFixture<Projection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Projection],
    }).compileComponents();

    fixture = TestBed.createComponent(Projection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
