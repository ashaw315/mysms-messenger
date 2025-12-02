import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private BACKEND_BASE_URL = environment.backendBaseUrl;

  private loggedIn$ = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.loggedIn$.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http
      .post(
        `${this.BACKEND_BASE_URL}/users/sign_in.json`,
        {
          user: { email, password },
        },
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(() => {
          this.loggedIn$.next(true);
        })
      );
  }

  logout() {
    return this.http
      .delete(`${this.BACKEND_BASE_URL}/users/sign_out.json`, {
        withCredentials: true,
      })
      .pipe(
        tap(() => {
          this.loggedIn$.next(false);
        })
      );
  }

  register(email: string, password: string, passwordConfirmation: string) {
    return this.http
      .post(
        `${this.BACKEND_BASE_URL}/users.json`,
        {
          user: {
            email,
            password,
            password_confirmation: passwordConfirmation, // include this if Devise validates it
          },
        },
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(() => {
          this.loggedIn$.next(true);
        })
      );
  }
}
