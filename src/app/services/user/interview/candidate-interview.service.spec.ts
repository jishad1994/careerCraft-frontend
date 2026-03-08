import { TestBed } from '@angular/core/testing';

import { CandidateInterviewService } from './candidate-interview.service';

describe('CandidateInterviewService', () => {
  let service: CandidateInterviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CandidateInterviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
