import { TestBed } from '@angular/core/testing';

import { CompanyJobService } from './company-job.service';

describe('CompanyJobService', () => {
  let service: CompanyJobService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyJobService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
