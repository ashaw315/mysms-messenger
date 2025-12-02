import { Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
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

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit() {
    if (!this.email || !this.password || this.loading) return;

    this.loading = true;
    this.error = null;

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.error = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Login error', err);

        this.loading = false;

        const serverError =
          err?.error?.error ||
          err?.error?.full_messages ||
          err?.message;

        if (Array.isArray(serverError)) {
          this.error = serverError.join(', ');
        } else if (typeof serverError === 'string') {
          this.error = serverError;
        } else if (err?.status === 401) {
          // Unauthorized but no message?friendly default.
          this.error = 'Invalid email or password.';
        } else {
          this.error = 'Login failed. Check your email and password.';
        }

        this.cdr.detectChanges();
      },
    });
  }

  onSwitchToSignup() {
    this.switchToSignup.emit();
  }
}