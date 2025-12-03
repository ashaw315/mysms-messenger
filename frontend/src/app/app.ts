import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { LoginComponent } from './login/login.component';
import { MessagesComponent } from './messages/messages.component';
import { SignupComponent } from './signup/signup.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    LoginComponent,
    MessagesComponent,
    SignupComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  showSignup: boolean = false;

  constructor(public auth: AuthService) {}

  ngOnInit() {
    // Reset to login view whenever user logs out
    this.auth.isLoggedIn$.subscribe((isLoggedIn) => {
      if (!isLoggedIn) {
        this.showSignup = false;
      }
    });
  }
}
