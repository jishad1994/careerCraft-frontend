import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddonsPurchaseComponent } from './addons-purchase.component';

describe('AddonsPurchaseComponent', () => {
  let component: AddonsPurchaseComponent;
  let fixture: ComponentFixture<AddonsPurchaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddonsPurchaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddonsPurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
