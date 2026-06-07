import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyOfferDetailComponent } from './company-offer-detail.component';

describe('CompanyOfferDetailComponent', () => {
  let component: CompanyOfferDetailComponent;
  let fixture: ComponentFixture<CompanyOfferDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyOfferDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyOfferDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
