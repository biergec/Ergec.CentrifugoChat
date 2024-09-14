import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Centrifuge } from 'centrifuge';

@Component({
  selector: 'app-public-chat-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './public-chat-lobby.component.html',
  styleUrl: './public-chat-lobby.component.scss',
})
export class PublicChatLobbyComponent implements OnInit {
  private httpClient = inject(HttpClient);

  @Input() userInfo: any;
  @Input() centrifuge: Centrifuge;

  messageList: any[] = [];
  message: string;

  ngOnInit() {
    this.connect();
  }

  async sendMessage() {
    let apiModel = {
      Sender: this.userInfo.Guid,
      SenderUserName: this.userInfo.UserName,
      Message: this.message,
    };

    await firstValueFrom(
      this.httpClient.post(
        environment.baseApiUrl + '/Centrifugo/SendMessagePublicChannel',
        apiModel
      )
    );

    this.message = null;
  }

  connect() {
    const generalChat = this.centrifuge.newSubscription('chat', {
      getToken: () => this.getToken('chat'),
    });

    // React on `news` channel real-time publications.
    generalChat
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
}
