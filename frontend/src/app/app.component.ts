import { Component, OnInit } from '@angular/core';
import { EventService } from './services/event.service';
import { Event } from './models/event.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  events: Event[] = [];
  selectedDate: string = '2026-07-13';
  currentUser: string | null = null;

  constructor(private eventService: EventService) {}

  ngOnInit() { this.loadEvents(); }

  loadEvents() {
    this.eventService.getEvents().subscribe(events => { this.events = events; });
  }

  onEventCreated(event: Event) {
    this.eventService.createEvent(event).subscribe(newEvent => {
      this.events.push(newEvent);
    });
  }

  onEventUpdated(event: Event) {
    this.eventService.updateEvent(event.id!, { attendees: event.attendees }).subscribe(() => {
      const idx = this.events.findIndex(e => e.id === event.id);
      if (idx !== -1) this.events[idx] = event;
    });
  }

  onEventDeleted(id: number) {
    this.eventService.deleteEvent(id).subscribe(() => {
      this.events = this.events.filter(e => e.id !== id);
    });
  }

  selectDate(date: string) { this.selectedDate = date; }
  setUser(nick: string) { this.currentUser = nick; }
}