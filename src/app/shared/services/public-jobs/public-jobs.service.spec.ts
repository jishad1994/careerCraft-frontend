import { TestBed } from '@angular/core/testing';

import { PublicJobsService } from './public-jobs.service';

describe('PublicJobsService', () => {
  let service: PublicJobsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicJobsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
