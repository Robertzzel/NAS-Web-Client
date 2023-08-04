import { Component, ChangeDetectorRef, IterableDiffers } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { File } from 'src/app/models/files';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { ModalTypes } from 'src/app/models/modals';

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

  constructor(private backend: BackendService) {
    this.refreshFiles()

    this.uploader = new FileUploader({
      url: this.backend.getLinkForUploadFile(),
      parametersBeforeFiles: true,
    });

    this.uploader.onBuildItemForm = (fileItem: FileItem, form: any) => {
      form.append('filename', `${this.currentPath}${fileItem._file.name}`);
    };

    this.uploader.onCompleteItem = (item: FileItem, response: string, status: number) => {
      this.refreshFiles()
    };
  }

  public get ModalTypes() {
    return ModalTypes; 
  }

  remove(file: string) {
    this.backend.removeFile(this.currentPath + file).subscribe((res) => {
      this.refreshFiles()
    })
  }

  downloadDirectory(file: string) {
    const url = this.backend.getLinkDownloadDirectory(this.currentPath + file)
    console.log(url)
    window.open(url, '_blank');
  }

  downloadAttachment(file: string) {
    console.log(file)
    const url = this.backend.getLinkDownloadAttachmentFile(this.currentPath + file)
    window.open(url, '_blank');
  }

  downloadInline(file: string) {
    console.log(file)
    const url = this.backend.getLinkDownloadInlineFile(this.currentPath + file)
    window.open(url, '_blank');
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
      if(res.status != 200) {
        return
      }

      this.files = res.body!
      this.filter = ""
      this.displayFiles()
    })
  }

  displayFiles() {
    if(this.filter === "") {
      this.displayedFiles = this.files
      return
    }
    this.displayedFiles = this.files.filter((v) => v.Name.toLowerCase().includes(this.filter.toLowerCase()))
  }

  onFilesAdd() {
    this.selectedModal = ModalTypes.AddFiles
  }

  onDirectoryCreate() {
    this.directoryNameToCreate = "sal"
    this.selectedModal = ModalTypes.Rename
  }

  createDir() {
    console.log("creating", this.currentPath + this.directoryNameToCreate)
    this.backend.createDirectory(this.currentPath + this.directoryNameToCreate).subscribe(res => {
      this.refreshFiles()
    })
  }
}
