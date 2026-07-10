import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent {
  @Input() selectedDate: string = '2026-07-13';
  @Input() currentUser: string | null = null;
  @Input() events: Event[] = [];
  @Output() eventCreated = new EventEmitter<Event>();
  @Output() eventUpdated = new EventEmitter<Event>();
  @Output() eventDeleted = new EventEmitter<number>();
  @Output() userSet = new EventEmitter<string>();

  event: Event = this.getEmptyEvent();
  showAuthModal: boolean = false;
  authNick: string = '';
  selectedEvent: Event | null = null;
  showAnnounce: boolean = false;

  readonly NAME_POOL = ['Алексей', 'Мария', 'Дмитрий', 'Екатерина'];
  readonly GLOBAL_ADMIN = 'orbeloha';

  getEmptyEvent(): Event {
    return {
      date: this.selectedDate || '2026-07-13',
      time: '10:00',
      duration: 60,
      type: 'обучение',
      floor: '17',
      location: 'холл',
      description: '',
      author: '',
      attendees: []
    };
  }

  get endTime(): string {
    if (!this.event.time || !this.event.duration) return '--:--';
    const [h, m] = this.event.time.split(':').map(Number);
    const total = h * 60 + m + this.event.duration;
    const eh = Math.floor(total / 60) % 24;
    const em = total % 60;
    return String(eh).padStart(2, '0') + ':' + String(em).padStart(2, '0');
  }

  getEndTime(ev: Event): string {
    if (!ev.time || !ev.duration) return '--:--';
    const [h, m] = ev.time.split(':').map(Number);
    const total = h * 60 + m + ev.duration;
    const eh = Math.floor(total / 60) % 24;
    const em = total % 60;
    return String(eh).padStart(2, '0') + ':' + String(em).padStart(2, '0');
  }

  getDayEvents(): Event[] { return this.events.filter(e => e.date === this.selectedDate); }

  createEvent() {
    if (!this.event.description.trim()) { alert('Введите описание события'); return; }
    if (this.event.duration < 30 || this.event.duration > 120) { alert('Длительность должна быть от 30 до 120 минут'); return; }
    if (this.event.floor === '17' && this.event.location === 'игровая') { alert('Игровая доступна только на 18 этаже'); return; }
    if (this.event.floor === '18' && this.event.location === 'холл') { alert('Холл доступен только на 17 этаже'); return; }

    const conflict = this.events.some(e => {
      if (e.id === this.selectedEvent?.id) return false;
      if (e.date !== this.event.date) return false;
      if (e.location !== this.event.location) return false;
      const eStart = new Date(`${e.date}T${e.time}`);
      const eEnd = new Date(`${e.date}T${e.time}`);
      eEnd.setMinutes(eEnd.getMinutes() + e.duration);
      const start = new Date(`${this.event.date}T${this.event.time}`);
      const end = new Date(`${this.event.date}T${this.event.time}`);
      end.setMinutes(end.getMinutes() + this.event.duration);
      return start < eEnd && end > eStart;
    });

    if (conflict) { alert('Конфликт: на это время и локацию уже есть событие'); return; }
    if (!this.currentUser) { this.showAuthModal = true; return; }

    this.event.author = this.currentUser;
    this.event.date = this.selectedDate;
    this.eventCreated.emit({ ...this.event });
    this.event = this.getEmptyEvent();
    this.selectedEvent = null;
  }

  confirmAuth() {
    const nick = this.authNick.trim();
    if (!nick) { alert('Введите ник'); return; }
    if (nick === this.GLOBAL_ADMIN) {
      this.currentUser = nick;
      this.userSet.emit(nick);
      this.showAuthModal = false;
      this.createEvent();
      return;
    }
    if (!this.NAME_POOL.includes(nick)) {
      alert(`Ник "${nick}" не найден. Доступны: ${this.NAME_POOL.join(', ')} или укажите "orbeloha"`);
      return;
    }
    this.currentUser = nick;
    this.userSet.emit(nick);
    this.showAuthModal = false;
    this.createEvent();
  }

  viewEvent(event: Event) { this.selectedEvent = event; this.showAnnounce = true; }

  toggleAttend() {
    if (!this.selectedEvent) return;
    if (!this.currentUser) { alert('Авторизуйтесь, чтобы отметить участие'); return; }
    const idx = this.selectedEvent.attendees.indexOf(this.currentUser);
    if (idx > -1) { this.selectedEvent.attendees.splice(idx, 1); } 
    else { this.selectedEvent.attendees.push(this.currentUser); }
    this.eventUpdated.emit(this.selectedEvent);
  }

  deleteEvent() {
    if (!this.selectedEvent) return;
    if (this.currentUser !== this.GLOBAL_ADMIN && this.currentUser !== this.selectedEvent.author) {
      alert('Вы не можете удалить это событие');
      return;
    }
    if (this.currentUser !== this.GLOBAL_ADMIN) {
      const start = new Date(`${this.selectedEvent.date}T${this.selectedEvent.time}`);
      const diff = (start.getTime() - Date.now()) / 60000;
      if (diff < 15) { alert('Нельзя отменить событие менее чем за 15 минут до начала'); return; }
    }
    this.eventDeleted.emit(this.selectedEvent.id!);
    this.showAnnounce = false;
    this.selectedEvent = null;
  }

  get isAttending(): boolean {
    if (!this.selectedEvent || !this.currentUser) return false;
    return this.selectedEvent.attendees.includes(this.currentUser);
  }

  canDelete(): boolean {
    if (!this.selectedEvent) return false;
    if (this.currentUser === this.GLOBAL_ADMIN) return true;
    return this.currentUser === this.selectedEvent.author;
  }

  exportToCalendar() {
    const dayEvents = this.getDayEvents();
    if (dayEvents.length === 0) { alert('Нет событий для добавления'); return; }
    let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Школа21//Календарь//RU\n';
    dayEvents.forEach(ev => {
      const start = new Date(`${ev.date}T${ev.time}`);
      const end = new Date(`${ev.date}T${ev.time}`);
      end.setMinutes(end.getMinutes() + ev.duration);
      const uid = `event-${ev.id}@school21`;
      const summary = ev.description.replace(/,/g, '\\,');
      ics += `BEGIN:VEVENT\nUID:${uid}\nDTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').split('.')[0]}Z\n`;
      ics += `DTSTART:${start.toISOString().replace(/[-:]/g,'').split('.')[0]}Z\n`;
      ics += `DTEND:${end.toISOString().replace(/[-:]/g,'').split('.')[0]}Z\n`;
      ics += `SUMMARY:${summary} (${ev.type})\nLOCATION:${ev.floor} этаж, ${ev.location}\nEND:VEVENT\n`;
    });
    ics += 'END:VCALENDAR';
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `calendar_${this.selectedDate}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
}