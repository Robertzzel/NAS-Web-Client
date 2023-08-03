import { Component } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { File } from 'src/app/models/files';

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

  constructor(private backend: BackendService) {
    this.refreshFiles()
  }

  remove(file: string) {
    this.backend.removeFile(this.currentPath + file).subscribe((res) => {
      this.refreshFiles()
    })
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
}
