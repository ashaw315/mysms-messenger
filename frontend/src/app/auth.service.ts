import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Make this readonly and clearly typed
  private readonly BACKEND_BASE_URL: string = environment.backendBaseUrl;

  private readonly loggedIn$ = new BehaviorSubject<boolean>(false);
  readonly isLoggedIn$: Observable<boolean> = this.loggedIn$.asObservable();

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
            password_confirmation: passwordConfirmation,
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
