export interface Event {
  id?: number;
  date: string;
  time: string;
  duration: number;
  type: 'обучение' | 'развлечение';
  floor: '17' | '18';
  location: 'холл' | 'кухня' | 'игровая' | 'коридор';
  description: string;
  author: string;
  attendees: string[];
}