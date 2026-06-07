import { TestBed } from '@angular/core/testing';

import { CompanyOfferLetterService } from './company-offer-letter.service';

describe('CompanyOfferLetterService', () => {
  let service: CompanyOfferLetterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyOfferLetterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
