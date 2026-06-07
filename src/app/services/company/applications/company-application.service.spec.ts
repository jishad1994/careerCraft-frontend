import { TestBed } from '@angular/core/testing';

import { CompanyApplicationService } from './company-application.service';

describe('CompanyApplicationService', () => {
  let service: CompanyApplicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyApplicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
