import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Guid } from 'typescript-guid';

@Component({
  selector: 'app-chat-welcome',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-welcome.component.html',
  styleUrl: './chat-welcome.component.scss',
})
export class ChatWelcomeComponent {
  private router = inject(Router);

  userName: string;
  isLoading = false;

  constructor() {
    this.checkLocalStorage();
  }

  checkLocalStorage() {
    if (localStorage.getItem('userName') && localStorage.getItem('userId')) {
      this.router.navigate(['/chat']);
    }
  }

  login() {
    this.isLoading = true;
    localStorage.setItem('userName', this.userName);
    localStorage.setItem('userId', Guid.create().toString());
    this.router.navigate(['/chat']);
  }
}
