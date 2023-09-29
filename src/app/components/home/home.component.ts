import { Component, Output, EventEmitter } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { File } from 'src/app/models/files';
import { UserDetails } from 'src/app/models/UserDetails';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { ModalTypes } from 'src/app/models/modals';
import { Notification } from 'src/app/models/notifications';
import { NotificationServiceService } from 'src/app/services/notification-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  files: File[] = []
  displayedFiles: File[] = []
  filter: string = ""
  currentPath: string = "/"
  selectedModal: ModalTypes = ModalTypes.AddFiles
  uploader: FileUploader
  directoryNameToCreate: string = "sal"
  sortingMethod: string = "time-newest"
  newFileName: string = ""
  oldFilename: string = ""
  userDetails: UserDetails = new UserDetails;
  @Output() showAlertEvent = new EventEmitter<{ message: string, timeSeconds: number, type: Notification }>();

  constructor(private backend: BackendService, private notificationService: NotificationServiceService, private router: Router) {
    this.refreshFiles()

    const headers = this.backend.getAuthHeaders()
    const auth = headers.get("Authentication")
    if(auth === null) {
      this.router.navigate(["login"])
    }

    this.uploader = new FileUploader({
      url: this.backend.getLinkForUploadFile(),
      parametersBeforeFiles: true,
      headers: [{name: "Authentication", value: auth!}],
      disableMultipart: true,
    });

    this.uploader.onBeforeUploadItem = (fileItem: FileItem ) => {
      fileItem.withCredentials = false;
      fileItem.url = `${this.backend.getLinkForUploadFile()}${this.currentPath}${fileItem._file.name}`
    }

    this.uploader.onCompleteItem = (item: FileItem, response: string, status: number) => {
      this.refreshFiles()
    };

    this.uploader.onCompleteAll = () => {
      while(this.uploader.queue.length > 0) {
        this.uploader.queue.pop()
      }
    }
  }

  public get ModalTypes() {
    return ModalTypes; 
  }

  displayAlert(message: string, timeSeconds: number, type: Notification) {
    this.notificationService.displayAlert(message, timeSeconds, type);
  }

  remove(file: string) {
    this.backend.removeFile(this.currentPath + file).subscribe(res => {
      if(res.status == 200) {
        this.displayAlert(`File ${this.currentPath + file} removed`, 2, Notification.Success)
      } else if(res.status == 401) { // StatusUnauthorized
        this.displayAlert(`You are not loggedd in`, 2, Notification.Warning)
        this.router.navigate(['/'])
        return
      } else if(res.status == 500) { // internal error
        this.displayAlert(`Cannot remove file ${this.currentPath + file}, internal error`, 2, Notification.Warning)
      } else if(res.status == 400) { // bad request
        this.displayAlert(`Cannot remove file ${this.currentPath + file}, bad request`, 2, Notification.Warning)
      } else {
        this.displayAlert(`Cannot remove file ${this.currentPath + file}, unknown reason`, 2, Notification.Danger)
      }
      this.refreshFiles()
    })
  }

  downloadDirectory(file: string) {
    const url = this.backend.getLinkDownloadDirectory(this.currentPath + file).subscribe(res => {
      const blobUrl = URL.createObjectURL(res);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = ''; // Leave the download attribute empty to use the default filename
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    })
  }

  downloadAttachment(file: string) {
    const url = this.backend.getLinkDownloadAttachmentFile(this.currentPath + file).subscribe(res => {
      const blobUrl = URL.createObjectURL(res);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = ''; // Leave the download attribute empty to use the default filename
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
    }, res => {
      if(res.status === 401) { // StatusUnauthorized
        this.displayAlert(`You are not loggedd in`, 2, Notification.Warning)
        this.router.navigate(['/'])
      } else if(res.status === 500) { // internal error
        this.displayAlert(`Cannot get files, internal error`, 2, Notification.Warning)
      } else if(res.status === 400) { // bad request
        this.displayAlert(`Cannot get files, bad request`, 2, Notification.Warning)
      } else {
        this.displayAlert(`Cannot get files, unknown error`, 2, Notification.Warning)
      }
    });
  }

  displayFiles() {
    if(this.filter === "") {
      this.displayedFiles = this.files
      return
    }
    this.displayedFiles = this.files.filter((v) => v.Name.toLowerCase().includes(this.filter.toLowerCase()))
    this.sortFiles()
  }

  onFilesAdd() {
    this.selectedModal = ModalTypes.AddFiles
  }

  onSettingsButton() {
    this.backend.getDetails().subscribe(res => {
        this.displayAlert("Success", 2, Notification.Success)

        this.userDetails.Username = res.body!.username
        this.userDetails.Max = res.body!.max
        this.userDetails.Used = res.body!.used
        this.selectedModal = ModalTypes.Settings
    }, res => {
      if(res.status == 401) { // StatusUnauthorized
        this.displayAlert(`You are not loggedd in`, 2, Notification.Warning)
        this.router.navigate(['/'])
      } else if(res.status == 500) { // internal error
        this.displayAlert(`Cannot get details, internal error`, 2, Notification.Warning)
      } else if(res.status == 400) { // bad request
        this.displayAlert(`Cannot get details, bad request`, 2, Notification.Warning)
      } else {
        this.displayAlert(`Cannot get details, unknown error`, 2, Notification.Warning)
      }
    })
  }

  onDirectoryCreate() {
    this.directoryNameToCreate = "sal"
    this.selectedModal = ModalTypes.CreateDir
  }

  createDir() {
    console.log("creating", this.currentPath + this.directoryNameToCreate)
    this.backend.createDirectory(this.currentPath + this.directoryNameToCreate).subscribe(res => {
      this.refreshFiles()
    })
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

  onRenameButton(value: string) {
    this.newFileName = this.currentPath + value
    this.oldFilename = this.newFileName
    this.selectedModal = ModalTypes.Rename
  }

  renameFile() {
    if(this.newFileName[0] != "/") {
      this.newFileName = "/" + this.newFileName
    }
    this.backend.renameFile(this.oldFilename, this.newFileName).subscribe(res => {
      this.displayAlert("Success", 2, Notification.Success)
      this.refreshFiles()
    }, res => {
      if(res.status == 401) { // StatusUnauthorized
        this.displayAlert(`You are not loggedd in`, 2, Notification.Warning)
        this.router.navigate(['/'])
      } else if(res.status == 500) { // internal error
        this.displayAlert(`Cannot rename file, internal error`, 2, Notification.Warning)
      } else if(res.status == 400) { // bad request
        this.displayAlert(`Cannot rename file, bad request`, 2, Notification.Warning)
      } else {
        this.displayAlert(`Cannot rename file, unknown error`, 2, Notification.Warning)
      }
    })
  }

  displayFileSize(fileItem: any): string {
    if (fileItem.file) {
      return this.formatFileSize(fileItem.file.size);
    }
    return '';
  }

  formatFileSize(size: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let index = 0;
    while (size >= 1024 && index < units.length - 1) {
      size /= 1024;
      index++;
    }
    return `${size.toFixed(2)} ${units[index]}`;
  }

  getTotalFileSize(): number {
    let totalSize = 0;
    this.uploader.queue.forEach((fileItem) => {
      if (fileItem.file) {
        totalSize += fileItem.file.size;
      }
    });
    return totalSize;
  }

  uploadFiles() {
    this.backend.getDetails().subscribe(res => {
      this.userDetails.Username = res.body!.username
      this.userDetails.Max = res.body!.max
      this.userDetails.Used = res.body!.used
      let remaining = this.userDetails.Max - this.userDetails.Used
      if(this.getTotalFileSize() > remaining) {
        this.displayAlert(`Not enough memory, only ${this.formatFileSize(remaining)} memory left`, 5, Notification.Warning)
      } else {
        this.uploader.uploadAll()
        this.displayAlert("Success", 2, Notification.Success)
      }
    }, res => {
      this.displayAlert(`Cannot upload`, 2, Notification.Warning)
    })
    
  }
}
