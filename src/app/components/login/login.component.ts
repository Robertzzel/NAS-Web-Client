import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import {HttpClientModule, HttpResponse} from '@angular/common/http';
import { NotificationServiceService } from 'src/app/services/notification-service.service';
import { Notification } from 'src/app/models/notifications';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = "";
  password: string = "";
  
  constructor(private backend: BackendService, private router: Router, private notificationService: NotificationServiceService, private cookieService: CookieService) {}

  onSubmit() {
    const cred = {"username": this.username, "password": this.password}
    this.backend.login(cred).subscribe(res => {
      const response = res.body

      this.cookieService.set(response.Name, response.Value, new Date(response.Expires), undefined, undefined, undefined, undefined)
      
      this.notificationService.displayAlert("Loggin Successful", 2, Notification.Success)
      this.router.navigate(["home"])
    }, res => {
      if(res.status === 401) {
        this.notificationService.displayAlert("Wrong username or password", 2, Notification.Danger)
      } else {
        this.notificationService.displayAlert("Internal error", 2, Notification.Warning)
      }
    })
  }
}
