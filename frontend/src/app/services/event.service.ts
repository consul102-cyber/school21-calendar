import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private apiUrl = '/api/events';
  constructor(private http: HttpClient) {}
  getEvents(): Observable<Event[]> { return this.http.get<Event[]>(this.apiUrl); }
  createEvent(event: Event): Observable<Event> { return this.http.post<Event>(this.apiUrl, event); }
  updateEvent(id: number, event: Partial<Event>): Observable<any> { return this.http.put(`${this.apiUrl}/${id}`, event); }
  deleteEvent(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/${id}`); }
}