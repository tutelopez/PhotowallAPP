import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestGalleryComponent } from './guest-gallery.component';

describe('GuestGalleryComponent', () => {
  let component: GuestGalleryComponent;
  let fixture: ComponentFixture<GuestGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestGalleryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuestGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
