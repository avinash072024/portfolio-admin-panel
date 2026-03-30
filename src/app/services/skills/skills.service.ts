import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SkillsService {

  constructor(private http: HttpClient) { }

  getSkills(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/skills`);
  }

  getAllSkills(page: number = 1, limit: number = 5): Observable<any> {
    const params = `?page=${page}&limit=${limit}`;
    return this.http.get(`${environment.apiUrl}/skills${params}`);
  }

  getSkillById(id: string): Observable<any> {
    return this.http.get(environment.apiUrl + `/skills/${id}`);
  }

  addSkill(data: any): Observable<any> {
    return this.http.post(environment.apiUrl + '/skills', data);
  }

  updateSkill(id: string, data: any): Observable<any> {
    return this.http.put(environment.apiUrl + `/skills/${id}`, data);
  }

  deleteSkill(id: string): Observable<any> {
    return this.http.delete(environment.apiUrl + `/skills/${id}`);
  }
}
