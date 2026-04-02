import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyInterviewListingComponent } from './company-interview-listing.component';

describe('CompanyInterviewListingComponent', () => {
  let component: CompanyInterviewListingComponent;
  let fixture: ComponentFixture<CompanyInterviewListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyInterviewListingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyInterviewListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
