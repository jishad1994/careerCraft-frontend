import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyOfferListComponent } from './company-offer-list.component';

describe('CompanyOfferListComponent', () => {
  let component: CompanyOfferListComponent;
  let fixture: ComponentFixture<CompanyOfferListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyOfferListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyOfferListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
