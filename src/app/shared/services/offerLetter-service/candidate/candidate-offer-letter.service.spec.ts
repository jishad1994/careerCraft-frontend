import { TestBed } from '@angular/core/testing';

import { CandidateOfferLetterService } from './candidate-offer-letter.service';

describe('CandidateOfferLetterService', () => {
  let service: CandidateOfferLetterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CandidateOfferLetterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
