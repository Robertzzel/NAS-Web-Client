import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import {HttpClientModule, HttpResponse} from '@angular/common/http';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = "";
  password: string = "";
  
  constructor(private backend: BackendService, private router: Router) {}

  onSubmit() {
    const cred = {"username": this.username, "password": this.password}
    this.backend.login(cred).subscribe((res: HttpResponse<any>) => {
      if(res.status != 200) {
        // falsh a message
      } else {
        this.router.navigate(["home"])
      }

    })
  }
}
