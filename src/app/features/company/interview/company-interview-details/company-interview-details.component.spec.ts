import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyInterviewDetailsComponent } from './company-interview-details.component';

describe('CompanyInterviewDetailsComponent', () => {
  let component: CompanyInterviewDetailsComponent;
  let fixture: ComponentFixture<CompanyInterviewDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyInterviewDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyInterviewDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
