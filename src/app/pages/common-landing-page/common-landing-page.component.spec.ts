import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonLandingPageComponent } from './common-landing-page.component';

describe('CommonLandingPageComponent', () => {
  let component: CommonLandingPageComponent;
  let fixture: ComponentFixture<CommonLandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonLandingPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
