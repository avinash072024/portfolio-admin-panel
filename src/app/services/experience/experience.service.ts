import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {
  private readonly apiUrl: string = `${environment.apiUrl}/experience`;
  sessionService = inject(SessionService);
  constructor(private http: HttpClient) { }

  getExperienceById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getExperience(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`);
  }

  addExperience(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  addMultipleExperience(data: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk`, data);
  }

  updateExperience(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteExperience(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
  }

  deleteMultipleExperience(ids: string[]): Observable<any> {
    return this.http.delete(`${this.apiUrl}/bulk`, { body: { ids } });
  }
}
