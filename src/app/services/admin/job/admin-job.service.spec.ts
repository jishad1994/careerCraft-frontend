import { TestBed } from '@angular/core/testing';

import { AdminJobService } from './admin-job.service';

describe('AdminJobService', () => {
  let service: AdminJobService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminJobService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
