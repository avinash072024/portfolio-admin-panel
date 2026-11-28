import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root'
})
export class SkillsService {
  private readonly apiUrl1: string = `${environment.apiUrl}/skills`;
  private readonly apiUrl2: string = `${environment.apiUrl}/skill-categories`;
  sessionService = inject(SessionService);
  constructor(private http: HttpClient) { }

  getSkills(): Observable<any> {
    return this.http.get(this.apiUrl1)
  }

  getSkillsAll(): Observable<any> {
    return this.http.get(`${this.apiUrl1}/all`)
  }

  getAllSkills(page: number = 1, limit: number = 5, search: string = ''): Observable<any> {
    let url = `${this.apiUrl1}/all`;
    let params = `?page=${page}&limit=${limit}`;
    if (search) {
      params += `&search=${encodeURIComponent(search)}`;
    }
    return this.http.get(`${url}${params}`);
  }

  getSkillById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl1}/${id}`);
  }

  addSkill(data: any): Observable<any> {
    return this.http.post(this.apiUrl1, data);
  }

  addMultipleSkills(data: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl1}/bulk`, data);
  }

  updateSkill(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl1}/${id}`, data);
  }

  deleteSkill(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl1}/${id}`);
  }

  deleteMultipleSkills(ids: string[]): Observable<any> {
    return this.http.delete(`${this.apiUrl1}/bulk`, {
      body: { ids }
    });
  }
  
  getSkillCategories(): Observable<any> {
    return this.http.get(this.apiUrl2);
  }

  addSkillCategory(data: any): Observable<any> {
    return this.http.post(this.apiUrl2, data);
  }

  deleteSkillCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl2}/${id}`);
  }

  updateSkillCategory(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl2}/${id}`, data);
  }
}
