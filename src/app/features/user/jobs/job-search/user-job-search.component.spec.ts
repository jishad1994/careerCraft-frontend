import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserJobSearchComponent } from './user-job-search.component';

describe('UserJobSearchComponent', () => {
  let component: UserJobSearchComponent;
  let fixture: ComponentFixture<UserJobSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserJobSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserJobSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
