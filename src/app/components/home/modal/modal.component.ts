import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FileItem, FileUploader } from 'ng2-file-upload';
import { UserDetails } from 'src/app/models/UserDetails';
import { ModalTypes } from 'src/app/models/modals';
import { BackendService } from 'src/app/services/backend.service';
import { NotificationServiceService } from 'src/app/services/notification-service.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() selectedModal: ModalTypes = ModalTypes.AddFiles
  uploader: FileUploader
  @Input() currentPath: string = "/"
  userDetails: UserDetails = new UserDetails;
  newFileName: string = ""
  oldFilename: string = ""
  directoryNameToCreate: string = ""

  constructor(private backend: BackendService, private notificationService: NotificationServiceService, private router: Router) {
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
      this.uploader.queue = this.uploader.queue.filter(it => it.file.name !== item.file.name)
    };

    this.uploader.onCompleteAll = () => {
      while(this.uploader.queue.length > 0) {
        this.uploader.queue.pop()
      }
    }
  }

  onAddFilesModalPressed() {
    this.selectedModal = ModalTypes.AddFiles
  }

  onCreateDirModalPressed() {
    this.selectedModal = ModalTypes.CreateDir
  }

  createDir() {
    this.backend.createDirectory(this.currentPath + this.directoryNameToCreate).subscribe(res => {})
  }

  onRenameModalPressed(value: string) {
    this.newFileName = this.currentPath + value
    this.oldFilename = this.newFileName
    this.selectedModal = ModalTypes.Rename
  }

  renameFile() {
    this.backend.renameFile(this.oldFilename, this.newFileName).subscribe(res => {}, this.handleError)
    this.newFileName = this.newFileName.substring(1)
  }

  moveFile() {
    console.log("#", `${this.currentPath}`, "#")
    this.backend.renameFile(
      `${this.currentPath}/${this.oldFilename}`,
      `${this.newFileName}`).subscribe(res => {}, this.handleError)
  }

  onMoveModalPressed(value: string) {
    this.newFileName = this.currentPath + value
    this.oldFilename = this.newFileName
    console.log(this.currentPath, this.newFileName, this.oldFilename)
    this.selectedModal = ModalTypes.Move
  }

  onSettingsModalPressed() {
    this.backend.getDetails().subscribe(res => {
      this.userDetails.Username = res.body!.username
      this.userDetails.Max = res.body!.max
      this.userDetails.Used = res.body!.used
      this.selectedModal = ModalTypes.Settings
    }, this.handleError)
  }

  uploadFiles() {
    this.backend.getDetails().subscribe(res => {
      this.userDetails.Username = res.body!.username
      this.userDetails.Max = res.body!.max
      this.userDetails.Used = res.body!.used
      let remaining = this.userDetails.Max - this.userDetails.Used
      if(this.getTotalFileSize() <= remaining) {
        this.uploader.uploadAll()
      }
    }, res => {
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

  public get ModalTypes() {
    return ModalTypes; 
  }

  handleError(
    res: any,
    unauthorizedHandler = () => {this.router.navigate(['/'])},
    internalErrorHandler = () => {},
    badRequestHandler = () => {},
    unknownErrorHandler = () => {},) {
    if(res.status == 401) {
      unauthorizedHandler()
    } else if(res.status == 500) {
      internalErrorHandler()
    } else if(res.status == 400) {
      badRequestHandler()
    } else {
      unknownErrorHandler()
    }
  }
}
