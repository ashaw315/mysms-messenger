import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

const API_BASE_URL = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private loggedIn$ = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.loggedIn$.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http
    .post(
      `${API_BASE_URL}/api/users/sign_in`,
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
      .delete(`${API_BASE_URL}/api/users/sign_out`, {
    withCredentials: true,
  })
    .pipe(
      tap(() => {
        this.loggedIn$.next(false);
      })
    );    
  }
}
