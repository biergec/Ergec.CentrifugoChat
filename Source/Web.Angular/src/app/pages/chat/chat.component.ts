import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Centrifuge } from 'centrifuge';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicChatLobbyComponent } from '../public-chat-lobby/public-chat-lobby.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, PublicChatLobbyComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, OnDestroy {
  private httpClient = inject(HttpClient);
  private router = inject(Router);

  userInfo: { UserName: string; Guid: string };

  token: string;
  loggedIn: boolean = false;

  centrifuge: Centrifuge;

  messageForm: { UserId?: string; Message?: string } = {};
  messageList: {
    SenderId: string;
    ReceiverId: string;
    SenderUserName: string;
    ReceiverUserName: string;
    Message: string;
    Date: Date;
  }[] = [];

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
      this.router.navigate(['/']);
    }
  }

  async sendMessage() {
    let apiModel = {
      Sender: this.userInfo.Guid,
      SenderUserName: this.userInfo.UserName,
      Message: this.messageForm.Message,
      Receiver: this.messageForm.UserId,
      ReceiverUserName: this.messageForm.UserId,
    };

    await firstValueFrom(
      this.httpClient.post(
        environment.baseApiUrl + '/Centrifugo/SendMessagePrivate',
        apiModel
      )
    );

    this.messageForm = {};
  }

  //#region Centrifuge Connection

  connect() {
    this.centrifuge = new Centrifuge(environment.centrifugeUrl, {
      getToken: () => this.getToken(),
      debug: true,
    });

    this.centrifuge.on('connected', (ctx) => {
      // now client connected to Centrifugo and authenticated.
      console.log('connected', ctx);
    });

    this.centrifuge.on('connecting', (ctx) => {
      // do whatever you need in case of connecting to a server
      console.log('connecting', ctx);
    });

    this.centrifuge.on('disconnected', (ctx) => {
      // do whatever you need in case of disconnect from server
      console.log('disconnected', ctx);
    });

    // Allocate Subscription to a channel.
    const userChatSub = this.centrifuge.newSubscription(
      '$' + this.userInfo.Guid,
      {
        getToken: () => this.getToken('$' + this.userInfo.Guid),
      }
    );

    // React on `news` channel real-time publications.
    userChatSub
      .on('publication', (ctx) => {
        if (!ctx.data.value) {
          return;
        }

        if (this.messageList == null) {
          this.messageList = [];
        }

        let model = JSON.parse(ctx.data.value);

        this.messageList.push(model);
      })
      .on('subscribing', (ctx) => {
        console.log(`subscribing: ${ctx.code}, ${ctx.reason}`);
      })
      .on('subscribed', (ctx) => {
        console.log('subscribed', ctx);
      })
      .on('unsubscribed', (ctx) => {
        console.log(`unsubscribed: ${ctx.code}, ${ctx.reason}`);
      })
      .subscribe();

    this.centrifuge.connect();
  }

  disconnect() {
    this.centrifuge.disconnect();
  }

  async getToken(channel: string = null) {
    let tokenModel = {
      Guid: localStorage.getItem('userId'),
      Name: localStorage.getItem('userName'),
      ChannelName: channel,
    };

    let tokenResponse: any = await firstValueFrom(
      this.httpClient.post(
        environment.baseApiUrl + '/Centrifugo/GenerateToken',
        tokenModel
      )
    );

    return tokenResponse.token;
  }

  //#endregion
}
