import { TestBed } from '@angular/core/testing';

import { UserJobApplicationService } from './user-job-application.service';

describe('UserJobApplicationService', () => {
  let service: UserJobApplicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserJobApplicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
