import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingChatBarComponent } from './floating-chat-bar.component';

describe('FloatingChatBarComponent', () => {
  let component: FloatingChatBarComponent;
  let fixture: ComponentFixture<FloatingChatBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingChatBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloatingChatBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
