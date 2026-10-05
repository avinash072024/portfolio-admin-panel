import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {
  constructor(private http: HttpClient) { }

  getExperienceById(id: string): Observable<any> {
    return this.http.get(environment.apiUrl + `/experience/${id}`);
  }

  getExperience(): Observable<any> {
    return this.http.get(environment.apiUrl + `/experience/all`);
  }

  addExperience(data: any): Observable<any> {
    return this.http.post(environment.apiUrl + '/experience', data);
  }

  updateExperience(id: string, data: any): Observable<any> {
    return this.http.put(environment.apiUrl + `/experience/${id}`, data);
  }

  deleteExperience(id: string): Observable<any> {
    return this.http.delete(environment.apiUrl + `/experience/${id}`)
  }

  deleteMultipleExperience(ids: string[]): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/experience/bulk`, { body: { ids } });
  }
}
