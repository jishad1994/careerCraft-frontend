import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateOfferDetailComponent } from './candidate-offer-detail.component';

describe('CandidateOfferDetailComponent', () => {
  let component: CandidateOfferDetailComponent;
  let fixture: ComponentFixture<CandidateOfferDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateOfferDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateOfferDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
