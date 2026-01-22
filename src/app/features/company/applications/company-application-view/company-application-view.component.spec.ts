import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyApplicationViewComponent } from './company-application-view.component';

describe('CompanyApplicationViewComponent', () => {
  let component: CompanyApplicationViewComponent;
  let fixture: ComponentFixture<CompanyApplicationViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyApplicationViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyApplicationViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
