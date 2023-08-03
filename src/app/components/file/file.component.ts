import { Component, Input, Output, EventEmitter } from '@angular/core';
import { File } from 'src/app/models/files';

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.css']
})
export class FileComponent {
  @Input() details: File = new File;
  @Output() cdEvent = new EventEmitter<string>();
  @Output() removeEvent = new EventEmitter<string>();
  @Output() downloadEvent = new EventEmitter<string>();

  cd(value: string) {
    this.cdEvent.emit(value);
  }

  remove(value: string) {
    this.removeEvent.emit(value);
  }

  download(value: string) {
    this.downloadEvent.emit(value);
  }
}
