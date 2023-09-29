import { HttpClient, HttpEvent, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { File } from 'src/app/models/files';
import { UserDetails } from '../models/UserDetails';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  baseUrl = "http://192.168.1.7:33334/api/"
  constructor(private httpClient: HttpClient, private cookieService: CookieService) { }

  getAuthHeaders(): HttpHeaders {
    let headers: HttpHeaders = new HttpHeaders()

    if(this.cookieService.check("ftp") === true){
      const cookie = this.cookieService.get("ftp")
      headers = new HttpHeaders({
        'Authentication': cookie
      });
    }

    return headers
  }

  listFiles(path: string) {
    const body = { 'path': path }
    return this.httpClient.post<File[]>(`${this.baseUrl}list`, body, { observe: 'response', headers: this.getAuthHeaders() })
  }

  login(body: any): Observable<HttpResponse<any>> {
    const res = this.httpClient.post<any>(this.baseUrl + "login", body, {observe: 'response'})
    return res
  }

  removeFile(path: string): Observable<HttpResponse<any>> {
    return this.httpClient.post<any>(this.baseUrl + "rm", {'path':path}, { observe: 'response', headers: this.getAuthHeaders() })
  }

  renameFile(oldPath: string, newPath: string) {
    return this.httpClient.post<any>(this.baseUrl + "rename", {'oldName': oldPath, "newName": newPath}, { observe: 'response', headers: this.getAuthHeaders() })
  }

  createDirectory(path: string) {
    return this.httpClient.post<any>(this.baseUrl + "directory", {'path':path}, { observe: 'response', headers: this.getAuthHeaders() })
  }

  getLinkDownloadAttachmentFile(path: string) {
    return this.httpClient.get(`${this.baseUrl}dwat/${path}`, { headers: this.getAuthHeaders(), responseType: 'blob' })
  }

  getLinkDownloadInlineFile(path: string) {
    return this.httpClient.get(`${this.baseUrl}dwin/${path}`, { headers: this.getAuthHeaders(), responseType: 'blob' })
  }

  getLinkDownloadDirectory(path: string) {
    return this.httpClient.get(`${this.baseUrl}dwdr/${path}`, { headers: this.getAuthHeaders(), responseType: 'blob' })
  }

  getLinkForUploadFile() {
    return `${this.baseUrl}upload`
  }

  getDetails() {
    return this.httpClient.get<any>(this.baseUrl + "details", { observe: 'response', headers: this.getAuthHeaders() })
  }
}
