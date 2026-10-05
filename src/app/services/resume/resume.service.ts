import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  constructor(private http: HttpClient) {}

  getATSResume(): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/resumes/generate-ats`, {
      responseType: 'blob',
    });
  }
  
}
