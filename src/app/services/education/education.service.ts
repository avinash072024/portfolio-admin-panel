import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root'
})
export class EducationService {
  sessionService = inject(SessionService);
  constructor(private http: HttpClient) { }

  getEducationById(id: string): Observable<any> {
    return this.http.get(environment.apiUrl + `/education/${id}`);
  }

  getEducation(): Observable<any> {
    return this.http.get(environment.apiUrl + `/education/all`);
  }

  addEducation(data: any): Observable<any> {
    return this.http.post(environment.apiUrl + '/education', data, this.sessionService.getAuthHeaders());
  }

  updateEducation(id: string, data: any): Observable<any> {
    return this.http.put(environment.apiUrl + `/education/${id}`, data, this.sessionService.getAuthHeaders());
  }

  deleteEducation(id: string): Observable<any> {
    return this.http.delete(environment.apiUrl + `/education/${id}`, this.sessionService.getAuthHeaders())
  }

  deleteMultipleEducation(ids: string[]): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/education/bulk`, { ...this.sessionService.getAuthHeaders(), body: { ids } });
  }
}
