import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root'
})
export class SkillsService {
  sessionService = inject(SessionService);

  constructor(private http: HttpClient) { }

  getSkills(): Observable<any> {
    return this.http.get(environment.apiUrl + '/skills')
  }

  getSkillsAll(): Observable<any> {
    return this.http.get(environment.apiUrl + '/skills/all')
  }

  getAllSkills(page: number = 1, limit: number = 5, search: string = ''): Observable<any> {
    let url = `${environment.apiUrl}/skills/all`;
    let params = `?page=${page}&limit=${limit}`;
    if (search) {
      params += `&search=${encodeURIComponent(search)}`;
    }
    return this.http.get(`${url}${params}`);
  }

  getSkillById(id: string): Observable<any> {
    return this.http.get(environment.apiUrl + `/skills/${id}`);
  }

  addSkill(data: any): Observable<any> {
    return this.http.post(environment.apiUrl + '/skills', data);
  }

  addMultipleSkills(data: any[]): Observable<any> {
    return this.http.post(environment.apiUrl + '/skills/bulk', data);
  }

  updateSkill(id: string, data: any): Observable<any> {
    return this.http.put(environment.apiUrl + `/skills/${id}`, data);
  }

  deleteSkill(id: string): Observable<any> {
    return this.http.delete(environment.apiUrl + `/skills/${id}`);
  }

  deleteMultipleSkills(ids: string[]): Observable<any> {
    return this.http.delete(environment.apiUrl + `/skills/bulk`, {
      body: { ids }
    });
  }
  
  getSkillCategories(): Observable<any> {
    return this.http.get(environment.apiUrl + `/skill-categories`);
  }

  addSkillCategory(data: any): Observable<any> {
    return this.http.post(environment.apiUrl + '/skill-categories', data);
  }

  deleteSkillCategory(id: string): Observable<any> {
    return this.http.delete(environment.apiUrl + `/skill-categories/${id}`);
  }

  updateSkillCategory(id: string, data: any): Observable<any> {
    return this.http.put(environment.apiUrl + `/skill-categories/${id}`, data);
  }
}
