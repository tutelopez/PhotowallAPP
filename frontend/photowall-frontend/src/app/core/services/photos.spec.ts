import { TestBed } from '@angular/core/testing';

import { Photos } from './photos';

describe('Photos', () => {
  let service: Photos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Photos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
