import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyAddressSectionComponent } from './company-address-section.component';

describe('CompanyAddressSectionComponent', () => {
  let component: CompanyAddressSectionComponent;
  let fixture: ComponentFixture<CompanyAddressSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyAddressSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyAddressSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
