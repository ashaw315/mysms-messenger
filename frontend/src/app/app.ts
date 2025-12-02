import { Component } from '@angular/core';
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
export class App {
  showSignup: boolean = false;
  constructor(public auth: AuthService) {}
}
