import { TestBed } from '@angular/core/testing';

import { ChatInitiationService } from './chat-initiation.service';

describe('ChatInitiationService', () => {
  let service: ChatInitiationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatInitiationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
