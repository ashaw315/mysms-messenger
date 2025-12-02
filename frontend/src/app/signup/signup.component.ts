import { Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  email: string = '';
  password: string = '';
  passwordConfirmation: string = '';
  loading: boolean = false;

  error: string | null = null;
  errorMessages: string[] = [];

  @Output() switchToLogin = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit() {
    if (
      !this.email ||
      !this.password ||
      !this.passwordConfirmation ||
      this.loading
    ) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.errorMessages = [];

    console.log('onSubmit start, loading:', this.loading);

    this.authService
      .register(this.email, this.password, this.passwordConfirmation)
      .subscribe({
        next: () => {
          console.log('Signup success');
          this.loading = false;
          this.error = null;
          this.errorMessages = [];
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log('Signup error handler hit, raw err:', err);

          this.loading = false;
          this.error = null;
          this.errorMessages = [];

          const errorsObj = err?.error?.errors;

          if (errorsObj && typeof errorsObj === 'object') {
            const fieldLabels: Record<string, string> = {
              email: 'Email',
              password: 'Password',
              password_confirmation: 'Password confirmation',
            };

            this.errorMessages = Object.entries(errorsObj).flatMap(
              ([field, messages]) => {
                const label =
                  fieldLabels[field] || field.replace(/_/g, ' ');

                if (Array.isArray(messages)) {
                  return messages.map((msg: any) => `${label} ${msg}`);
                } else if (typeof messages === 'string') {
                  return [`${label} ${messages}`];
                }
                return [];
              }
            );
          }

          // Fallbacks if errorsObj was missing
          if (!this.errorMessages.length) {
            const serverErrors =
              err?.error?.full_messages ||
              err?.error?.error;

            if (Array.isArray(serverErrors)) {
              this.errorMessages = serverErrors;
            } else if (typeof serverErrors === 'string') {
              this.errorMessages = [serverErrors];
            } else {
              this.error = 'Sign up failed. Please check your email and password.';
            }
          }

          console.log('After error handler: loading =', this.loading);
          console.log('Parsed errorMessages:', this.errorMessages);
          console.log('Final error:', this.error);

          this.cdr.detectChanges();
        },
      });
  }

  onSwitchToLogin() {
    this.switchToLogin.emit();
  }
}
