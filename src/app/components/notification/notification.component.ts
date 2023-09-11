import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-notification',
  template: '<div class="alert alert-{{type}}" role="alert"> {{ message }} </div>',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent {
  @Input() message: string = '';
  @Input() type: string = '';
}
