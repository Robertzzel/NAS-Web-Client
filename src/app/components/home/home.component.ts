import { Component, Output, EventEmitter, ViewChild, OnInit } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { File } from 'src/app/models/files';
import { UserDetails } from 'src/app/models/UserDetails';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { ModalTypes } from 'src/app/models/modals';
import { Notification } from 'src/app/models/notifications';
import { NotificationServiceService } from 'src/app/services/notification-service.service';
import { Router } from '@angular/router';
import { ModalComponent } from './modal/modal.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  files: File[] = []
  displayedFiles: File[] = []
  filter: string = ""
  currentPath: string = "/"
  selectedModal: ModalTypes = ModalTypes.AddFiles
  sortingMethod: string = "time-newest"
  
  @Output() showAlertEvent = new EventEmitter<{ message: string, timeSeconds: number, type: Notification }>();
  @ViewChild(ModalComponent, {static : true}) modal : ModalComponent | undefined;

  constructor(private backend: BackendService, private notificationService: NotificationServiceService, private router: Router) {}

  ngOnInit() {
    this.refreshFiles()
  }

  displayAlert(message: string, timeSeconds: number, type: Notification) {
    this.notificationService.displayAlert(message, timeSeconds, type);
  }

  removeFile(file: string) {
    this.backend.removeFile(this.currentPath + file).subscribe(res => {
      this.displayAlert(`File ${this.currentPath + file} removed`, 2, Notification.Success)
      this.refreshFiles()
    }, this.handleError)
  }

  downloadDirectory(file: string) {
    this.backend.getLinkDownloadDirectory(this.currentPath + file).subscribe(res => {
      const blobUrl = URL.createObjectURL(res);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = file;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    })
  }

  downloadFileAttachment(file: string) {
    this.backend.getLinkDownloadAttachmentFile(this.currentPath + file).subscribe(res => {
      const blobUrl = URL.createObjectURL(res);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = '';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    }, res => {
      console.log("ERROR", res)
    })
  }

  downloadInline(file: string) {
    this.backend.getLinkDownloadInlineFile(this.currentPath + file).subscribe(res => {
      const blobUrl = URL.createObjectURL(res);
      window.open(blobUrl, '_blank');
    }, res => {
      console.log("ERROR", res)
    })
  }

  cdup() {
    const split = this.currentPath.split("/").filter((v) => v !== "")
    this.currentPath = "/"
    for(let i=0;i<split.length-1;i++){
      this.currentPath += `${split[i]}/`
    }
    this.refreshFiles()
  }

  cd(dir: string) {
    this.currentPath = this.currentPath + dir + "/"
    this.refreshFiles()
  }

  refreshFiles() {
    this.backend.listFiles(this.currentPath).subscribe(res => {
        this.files = res.body!
        this.filter = ""
        this.displayFiles()
        this.displayAlert("Success", 2, Notification.Success)
    }, this.handleError);
  }

  displayFiles() {
    if(this.filter === "") {
      this.displayedFiles = this.files
      return
    }
    this.displayedFiles = this.files.filter((v) => v.Name.toLowerCase().includes(this.filter.toLowerCase()))
    this.sortFiles()
  }

  sortFiles() {
    console.log(this.sortingMethod)
    switch(this.sortingMethod) {
      case "name-asc":
        this.displayedFiles.sort(function (a, b) {
          return a.Name < b.Name ? -1 : 1;
        });
        break
      case "name-desc":
        this.displayedFiles.sort(function (a, b) {
          return a.Name < b.Name ? 1 : -1;
        });
        break
      case "time-newest":
        this.displayedFiles.sort((a, b) => b.CreatingTime - a.CreatingTime);
        console.log(this.displayedFiles.map(v=>v.CreatingTime))
        break
      case "time-oldest":
        this.displayedFiles.sort((a, b) => a.CreatingTime - b.CreatingTime);
        console.log(this.displayedFiles.map(v=>v.CreatingTime))
        break
      default:
        this.displayedFiles.sort((a, b) => b.CreatingTime - a.CreatingTime);
        break;
    }
  }

  renameFile() {
    this.modal?.renameFile()
    this.refreshFiles()
  }

  handleError(
    res: any,
    unauthorizedHandler = () => {this.router.navigate(['/'])},
    internalErrorHandler = () => {},
    badRequestHandler = () => {},
    unknownErrorHandler = () => {},) {
    if(res.status == 401) {
      this.displayAlert(`You are not loggedd in`, 2, Notification.Warning)
      unauthorizedHandler()
    } else if(res.status == 500) {
      this.displayAlert(`Internal error`, 2, Notification.Warning)
      internalErrorHandler()
    } else if(res.status == 400) {
      this.displayAlert(`Bad request`, 2, Notification.Warning)
      badRequestHandler()
    } else {
      this.displayAlert(`Unknown error`, 2, Notification.Warning)
      unknownErrorHandler()
    }
  }
}
