import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyBasicProfileComponent } from './company-basic-profile.component';

describe('CompanyBasicProfileComponent', () => {
  let component: CompanyBasicProfileComponent;
  let fixture: ComponentFixture<CompanyBasicProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyBasicProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyBasicProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
