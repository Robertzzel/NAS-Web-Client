import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { File } from 'src/app/models/files';
import { UserDetails } from '../models/UserDetails';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  baseUrl = "http://localhost:8000/api/"
  constructor(private httpClient: HttpClient) { }

  listFiles(path: string) {
    return this.httpClient.post<File[]>(this.baseUrl + "list", {'path':path}, { withCredentials: true, observe: 'response' })
  }

  login(body: any) {
    return this.httpClient.post<any>(this.baseUrl + "login", body, { withCredentials: true, observe: 'response' })
  }

  removeFile(path: string) {
    return this.httpClient.post<any>(this.baseUrl + "rm", {'path':path}, { withCredentials: true, observe: 'response' })
  }

  renameFile(oldPath: string, newPath: string) {
    return this.httpClient.post<any>(this.baseUrl + "rename", {'oldName': oldPath, "newName": newPath}, { withCredentials: true, observe: 'response' })
  }

  createDirectory(path: string) {
    return this.httpClient.post<any>(this.baseUrl + "directory", {'path':path}, { withCredentials: true, observe: 'response' })
  }

  getLinkDownloadAttachmentFile(path: string) {
    return `${this.baseUrl}dwat/${path}`
  }

  getLinkDownloadInlineFile(path: string) {
    return `${this.baseUrl}dwin/${path}`
  }

  getLinkDownloadDirectory(path: string) {
    return `${this.baseUrl}dwdr/${path}`
  }

  getLinkForUploadFile() {
    return `${this.baseUrl}upload`
  }

  getDetails() {
    return this.httpClient.get<any>(this.baseUrl + "details", { withCredentials: true, observe: 'response' })
  }
}
