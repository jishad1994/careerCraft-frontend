import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyDocumentSectionComponent } from './company-document-section.component';

describe('CompanyDocumentSectionComponent', () => {
  let component: CompanyDocumentSectionComponent;
  let fixture: ComponentFixture<CompanyDocumentSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyDocumentSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyDocumentSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
