import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import {HttpClientModule, HttpResponse} from '@angular/common/http';
import { NotificationServiceService } from 'src/app/services/notification-service.service';
import { Notification } from 'src/app/models/notifications';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = "";
  password: string = "";
  
  constructor(private backend: BackendService, private router: Router, private notificationService: NotificationServiceService) {}

  onSubmit() {
    const cred = {"username": this.username, "password": this.password}
    this.backend.login(cred).subscribe(res => {
      this.router.navigate(["home"])
      this.notificationService.displayAlert("Loggin Successfull", 2, Notification.Success)
    }, res => {
      if(res.status === 401) {
        this.notificationService.displayAlert("Wrong username or password", 2, Notification.Danger)
      } else {
        this.notificationService.displayAlert("Internal error", 2, Notification.Warning)
      }
    })
  }
}
