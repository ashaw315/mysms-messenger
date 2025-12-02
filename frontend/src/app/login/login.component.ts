import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  error: string | null = null;

  @Output() switchToSignup = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  onSubmit() {
    if (!this.email || !this.password || this.loading) return;

    this.loading = true;
    this.error = null;

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Login failed. Check your email and password.';
        console.error('Login error', err);
      },
    });
  }

  onSwitchToSignup() {
    this.switchToSignup.emit();
  }
}