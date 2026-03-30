import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class EducationService {
  constructor(private http: HttpClient) { }

  getEducationById(id: string): Observable<any> {
    return this.http.get(environment.apiUrl + `/education/${id}`);
  }

  getEducation(): Observable<any> {
    return this.http.get(environment.apiUrl + `/education`);
  }

  addEducation(data: any): Observable<any> {
    return this.http.post(environment.apiUrl + '/education', data);
  }

  updateEducation(id: string, data: any): Observable<any> {
    return this.http.put(environment.apiUrl + `/education/${id}`, data);
  }

  deleteEducation(id: string): Observable<any> {
    return this.http.delete(environment.apiUrl + `/education/${id}`)
  }
}
