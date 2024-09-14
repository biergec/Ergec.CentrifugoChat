import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicChatLobbyComponent } from './public-chat-lobby.component';

describe('PublicChatLobbyComponent', () => {
  let component: PublicChatLobbyComponent;
  let fixture: ComponentFixture<PublicChatLobbyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicChatLobbyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicChatLobbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
