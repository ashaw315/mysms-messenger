import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
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
  readonly DEFAULT_RECIPIENT_NUMBER = '+18777804236';

  messages: Message[] = [];
  recipient_number: string = this.DEFAULT_RECIPIENT_NUMBER;
  content = '';
  sending = false;
  sendError: string | null = null;
  loadingMessages = false;
  loadError: string | null = null;

  private pollIntervalId: any;

  constructor(
    private messagesService: MessagesService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadMessages();

     this.pollIntervalId = setInterval(() => {
      this.loadMessages(false); // pass false so we don’t show "Loading..." every time
    }, 10000);
  }

  ngOnDestroy() {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
    }
  }

  loadMessages(showSpinner: boolean = true) {
    if (showSpinner) {
      this.loadingMessages = true;
      this.loadError = null;
    }

    this.messagesService.getMessages().subscribe({
      next: (msgs) => {
        this.messages = msgs;
        this.loadingMessages = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load messages', err);
        this.loadingMessages = false;
        this.loadError = 'Could not load messages.';
        this.cdr.detectChanges();
      },
    });
  }

  onSend() {
    if (!this.recipient_number || !this.content || this.sending) return;

    this.sending = true;
    this.sendError = null;
    this.cdr.detectChanges(); // reflect button disabled state immediately

    this.messagesService
      .sendMessage(this.recipient_number, this.content)
      .subscribe({
        next: (msg) => {
          this.sending = false;
          // prepend new message so it appears at top
          this.messages.unshift(msg);
          this.recipient_number = '';
          this.content = '';
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to send message', err);
          this.sending = false;

          const serverErrors =
            err?.error?.errors ||
            err?.error?.error ||
            err?.message;

          if (Array.isArray(serverErrors)) {
            this.sendError = serverErrors.join(' ');
          } else if (typeof serverErrors === 'string') {
            this.sendError = serverErrors;
          } else {
            this.sendError = 'Failed to send message.';
          }

          this.cdr.detectChanges();
        },
      });
  }

   clearForm() {
    this.content = '';
    this.recipient_number = this.DEFAULT_RECIPIENT_NUMBER;
    this.sendError = null;
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        // AuthService flips isLoggedIn$ to false; parent app reacts
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Logout failed', err);
        this.cdr.detectChanges();
      },
    });
  }
}
