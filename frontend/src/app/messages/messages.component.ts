import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagesService } from '../messages.service';
import { Message } from '../message.model';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
})
export class MessagesComponent implements OnInit {
  messages: Message[] = [];
  recipient_number = '';
  content = '';
  sending = false;
  sendError: string | null = null;
  loadingMessages = false;
  loadError: string | null = null;

  constructor(
    private messagesService: MessagesService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    this.loadingMessages = true;
    this.loadError = null;

    this.messagesService.getMessages().subscribe({
      next: (msgs) => {
        this.messages = msgs;
        this.loadingMessages = false;
      },
      error: (err) => {
        console.error('Failed to load messages', err);
        this.loadingMessages = false;
        this.loadError = 'Could not load messages.';
      },
    });
  }

  onSend() {
    if (!this.recipient_number || !this.content || this.sending) return;

    this.sending = true;
    this.sendError = null;

    this.messagesService
      .sendMessage(this.recipient_number, this.content)
      .subscribe({
        next: (msg) => {
          this.sending = false;
          this.messages.unshift(msg);
          this.recipient_number = '';
          this.content = '';
        },
        error: (err) => {
          console.error('Failed to send message', err);
          this.sending = false;
          this.sendError = 'Failed to send message.';
        },
      });
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        // AuthService flips isLoggedIn$ to false
      },
      error: (err) => {
        console.error('Logout failed', err);
      },
    });
  }
}
