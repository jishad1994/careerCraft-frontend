import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateInterviewListingComponent } from './candidate-interview-listing.component';

describe('CandidateInterviewListingComponent', () => {
  let component: CandidateInterviewListingComponent;
  let fixture: ComponentFixture<CandidateInterviewListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateInterviewListingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateInterviewListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
