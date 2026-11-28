import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root'
})
export class EducationService {
  private readonly apiUrl: string = `${environment.apiUrl}/education`;
  sessionService = inject(SessionService);
  constructor(private http: HttpClient) { }

  getEducationById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`)
  }

  getEducation(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`);
  }

  addEducation(data: any): Observable<any> {
    return this.http.post(environment.apiUrl + '/education', data);
  }

  addMultipleEducation(data: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk`, data);
  }

  updateEducation(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteEducation(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
  }

  deleteMultipleEducation(ids: string[]): Observable<any> {
    return this.http.delete(`${this.apiUrl}/bulk`, { body: { ids } });
  }
}
