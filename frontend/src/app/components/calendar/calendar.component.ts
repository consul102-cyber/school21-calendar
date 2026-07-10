import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  @Input() events: Event[] = [];
  @Input() selectedDate: string = '2026-07-13';
  @Output() dateSelected = new EventEmitter<string>();
  days: { date: string; day: number; isWeekend: boolean }[] = [];
  weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  ngOnInit() { this.generateDays(); }

  generateDays() {
    const start = new Date('2026-07-13');
    const end = new Date('2026-07-26');
    this.days = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      this.days.push({ date: `${year}-${month}-${day}`, day: d.getDate(), isWeekend: d.getDay() === 0 || d.getDay() === 6 });
    }
  }

  getDayEvents(date: string): Event[] { return this.events.filter(e => e.date === date); }
  selectDay(date: string) { this.dateSelected.emit(date); }
  isSelected(date: string): boolean { return this.selectedDate === date; }
}