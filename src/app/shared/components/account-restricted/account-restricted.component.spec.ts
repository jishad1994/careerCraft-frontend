import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountRestrictedComponent } from './account-restricted.component';

describe('AccountRestrictedComponent', () => {
  let component: AccountRestrictedComponent;
  let fixture: ComponentFixture<AccountRestrictedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountRestrictedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountRestrictedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
