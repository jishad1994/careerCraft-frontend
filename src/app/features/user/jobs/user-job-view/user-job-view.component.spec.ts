import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserJobViewComponent } from './user-job-view.component';

describe('UserJobViewComponent', () => {
  let component: UserJobViewComponent;
  let fixture: ComponentFixture<UserJobViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserJobViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserJobViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
