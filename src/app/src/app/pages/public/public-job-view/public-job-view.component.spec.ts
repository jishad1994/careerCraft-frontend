import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicJobViewComponent } from './public-job-view.component';

describe('PublicJobViewComponent', () => {
  let component: PublicJobViewComponent;
  let fixture: ComponentFixture<PublicJobViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicJobViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicJobViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
