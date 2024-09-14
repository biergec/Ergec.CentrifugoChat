import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Centrifuge } from 'centrifuge';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, OnDestroy {
  private httpClient = inject(HttpClient);
  private router = inject(Router);

  userInfo: { UserName: string; Guid: string };

  token: string;
  loggedIn: boolean = false;

  centrifuge = new Centrifuge(environment.centrifugeUrl, {
    getToken: this.getToken.bind(this),
  });

  ngOnInit() {
    this.checkUserInfo();
    this.connect();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  checkUserInfo() {
    this.userInfo = {
      Guid: localStorage.getItem('userId'),
      UserName: localStorage.getItem('userName'),
    };

    if (!this.userInfo.UserName || !this.userInfo.Guid) {
      this.router.navigate(['/chat-welcome']);
    }
  }

  connect() {
    this.centrifuge.on('connected', function (ctx) {
      // now client connected to Centrifugo and authenticated.
      console.log('connected', ctx);
    });

    this.centrifuge.on('connecting', function (ctx) {
      // do whatever you need in case of connecting to a server
      console.log('connecting', ctx);
    });

    this.centrifuge.on('disconnected', function (ctx) {
      // do whatever you need in case of disconnect from server
      console.log('disconnected', ctx);
    });

    this.centrifuge.connect();
  }

  disconnect() {
    this.centrifuge.disconnect();
  }

  async getToken() {
    let tokenModel = {
      Guid: localStorage.getItem('userId'),
      Name: localStorage.getItem('userName'),
    };

    let tokenResponse: any = await firstValueFrom(
      this.httpClient.post(
        environment.baseApiUrl + '/Centrifugo/GenerateToken',
        tokenModel
      )
    );

    return tokenResponse.token;
  }
}
