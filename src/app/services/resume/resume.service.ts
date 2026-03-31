import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  constructor(private http: HttpClient) { }

  getResumes(): Observable<any> {
    return this.http.get(environment.apiUrl + `/resumes`);
  }

  getResume(id: string): Observable<any> {
    return this.http.get(environment.apiUrl + `/resumes/${id}`);
  }

  addResume(formData: FormData): Observable<any> {
    return this.http.post(environment.apiUrl + `/resumes`, formData);
  }

  updateResume(id: string, formData: FormData): Observable<any> {
    return this.http.put(environment.apiUrl + `/resumes/${id}`, formData);
  }

  deleteResume(id: string): Observable<any> {
    return this.http.delete(environment.apiUrl + `/resumes/${id}`);
  }
}
