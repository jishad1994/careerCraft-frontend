import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateApplicationViewComponent } from './application-view.component';

describe('ApplicationViewComponent', () => {
  let component: CandidateApplicationViewComponent;
  let fixture: ComponentFixture<CandidateApplicationViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateApplicationViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateApplicationViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
