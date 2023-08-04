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
  @Output() downloadAttachmentEvent = new EventEmitter<string>();
  @Output() downloadInlineEvent = new EventEmitter<string>();
  @Output() downloadDirectoryEvent = new EventEmitter<string>();

  cd(value: string) {
    this.cdEvent.emit(value);
  }

  remove(value: string) {
    this.removeEvent.emit(value);
  }

  downloadAttachment() {
    console.log("downloading...")
    if(this.details.IsDir) {
      this.downloadDirectoryEvent.emit(this.details.Name);
      console.log("dir...")
    } else {
      this.downloadAttachmentEvent.emit(this.details.Name);
      console.log("file...")
    }
  }

  downloadInline(value: string) {
    this.downloadInlineEvent.emit(value);
  }
}
