import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyApplicationsListComponent } from './company-applications-list.component';

describe('CompanyApplicationsListComponent', () => {
  let component: CompanyApplicationsListComponent;
  let fixture: ComponentFixture<CompanyApplicationsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyApplicationsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyApplicationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
