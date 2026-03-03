import { TestBed } from '@angular/core/testing';

import { CompanySubscriptionService } from './company-subscription.service';

describe('CompanySubscriptionService', () => {
  let service: CompanySubscriptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanySubscriptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
