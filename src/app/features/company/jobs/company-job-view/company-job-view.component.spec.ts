import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyJobViewComponent } from './company-job-view.component';

describe('CompanyJobViewComponent', () => {
  let component: CompanyJobViewComponent;
  let fixture: ComponentFixture<CompanyJobViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyJobViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyJobViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
