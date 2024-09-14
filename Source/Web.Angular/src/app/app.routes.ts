import { Routes } from '@angular/router';
import { ChatComponent } from './pages/chat/chat.component';
import { ChatWelcomeComponent } from './pages/chat-welcome/chat-welcome.component';

export const routes: Routes = [
  {
    path: '',
    component: ChatWelcomeComponent,
  },
  {
    path: 'chat',
    component: ChatComponent,
  },
];
