import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

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

  generateCoverLetter(companyName: string, subject: string): Observable<Blob> {
    const params = new HttpParams()
      .set('companyName', companyName.trim())
      .set('subject', subject.trim());

    return this.http.get(`${environment.apiUrl}/resumes/generate-cover-letter`, {
      params,
      responseType: 'blob',
    });
  }
  
}
