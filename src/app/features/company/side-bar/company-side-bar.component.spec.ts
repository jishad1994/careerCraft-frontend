import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanySideBarComponent } from './company-side-bar.component';

describe('SideBarComponent', () => {
  let component: CompanySideBarComponent;
  let fixture: ComponentFixture<CompanySideBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanySideBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanySideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
