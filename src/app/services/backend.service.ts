import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { File } from 'src/app/models/files';

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

  getCwd() {
    return this.httpClient.get<any>(this.baseUrl + "cwd", { withCredentials: true, observe: 'response' })
  }
}
