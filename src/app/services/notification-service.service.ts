import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Notification } from '../models/notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationServiceService {
  private displayAlertSource = new BehaviorSubject<{ message: string, timeSeconds: number, type: Notification } | null>(null);
  displayAlert$ = this.displayAlertSource.asObservable();

  constructor() { }

  displayAlert(message: string, timeSeconds: number, type: Notification) {
    this.displayAlertSource.next({ message, timeSeconds, type });
  }
}
