import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message } from './message.model';

const API_BASE_URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  constructor(private http: HttpClient) {}

  getMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(`${API_BASE_URL}/messages.json`, { 
        withCredentials: true 
    });
  }

  sendMessage(recipient_number: string, content: string): Observable<Message> {
    return this.http.post<Message>(`${API_BASE_URL}/messages.json`, 
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