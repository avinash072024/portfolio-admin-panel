import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {
  constructor(private http: HttpClient) { }

  getProjectById(id: string): Observable<any> {
    return this.http.get(environment.apiUrl + `/experience/${id}`);
  }

  getProject(): Observable<any> {
    return this.http.get(environment.apiUrl + `/experience`);
  }

  addProject(data: any): Observable<any> {
    return this.http.post(environment.apiUrl + '/experience', data);
  }

  updateProject(id: string, data: any): Observable<any> {
    return this.http.put(environment.apiUrl + `/experience/${id}`, data);
  }

  deleteProject(id: string): Observable<any> {
    return this.http.delete(environment.apiUrl + `/experience/${id}`)
  }
}
