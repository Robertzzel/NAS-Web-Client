import { Component } from '@angular/core';
import { Notification } from 'src/app/models/notifications';
import { NotificationServiceService } from './services/notification-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showAlert: boolean = false;
  alertMessage: string = '';
  notificationType: string = "success"

  constructor(private notificationService: NotificationServiceService) {
    this.notificationService.displayAlert$.subscribe(res => {
      if(res !== null) {
        this.displayAlert(res)
      }
    })
  }

  displayAlert(event: any) {
    this.showAlert = true;
    this.alertMessage = event.message;
    switch(event.type) {
      case Notification.Success:
        this.notificationType = "success"
        break
      case Notification.Info:
        this.notificationType = "info"
        break
      case Notification.Warning:
        this.notificationType = "warning"
        break
      case Notification.Danger:
        this.notificationType = "danger"
        break
    }
    setTimeout(() => {
      this.showAlert = false;
      this.alertMessage = '';
    }, event.timeSeconds * 1000);
    console.log("shown")
  }
}
