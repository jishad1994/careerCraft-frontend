import { TestBed } from '@angular/core/testing';

import { UserJobService } from './user-job.service';

describe('UserJobService', () => {
  let service: UserJobService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserJobService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
