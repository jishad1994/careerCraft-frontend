import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminJobViewComponent } from './admin-job-view.component';

describe('AdminJobViewComponent', () => {
  let component: AdminJobViewComponent;
  let fixture: ComponentFixture<AdminJobViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminJobViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminJobViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
