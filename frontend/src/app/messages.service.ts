import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message } from './message.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private API_BASE_URL = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.API_BASE_URL}/messages.json`, { 
      withCredentials: true 
    });
  }

  sendMessage(recipient_number: string, content: string): Observable<Message> {
    return this.http.post<Message>(
      `${this.API_BASE_URL}/messages.json`,
      {
        message: {
          recipient_number,
          content
        }
      },
      {
        withCredentials: true
      }
    );
  }
}
