import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionPlanFormComponent } from './subscription-plan-form.component';

describe('SubscriptionPlanFormComponent', () => {
  let component: SubscriptionPlanFormComponent;
  let fixture: ComponentFixture<SubscriptionPlanFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionPlanFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionPlanFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
