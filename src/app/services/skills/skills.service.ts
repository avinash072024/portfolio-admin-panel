import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root'
})
export class SkillsService {
  // private cachedSkills$?: Observable<any>;
  sessionService = inject(SessionService);

  constructor(private http: HttpClient) { }

  // getSkills(): Observable<any> {
  //   if (!this.cachedSkills$) {
  //     this.cachedSkills$ = this.http.get(environment.apiUrl + '/skills').pipe(
  //       shareReplay({ bufferSize: 1, refCount: true, windowTime: 300000 }),
  //       catchError(err => {
  //         this.cachedSkills$ = undefined;
  //         return throwError(() => err);
  //       })
  //     );
  //   }
  //   return this.cachedSkills$;
  // }

  getSkills(): Observable<any> {
    return this.http.get(environment.apiUrl + '/skills')
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
    return this.http.post(environment.apiUrl + '/skills', data, this.sessionService.getAuthHeaders());
  }

  updateSkill(id: string, data: any): Observable<any> {
    return this.http.put(environment.apiUrl + `/skills/${id}`, data, this.sessionService.getAuthHeaders());
  }

  deleteSkill(id: string): Observable<any> {
    return this.http.delete(environment.apiUrl + `/skills/${id}`, this.sessionService.getAuthHeaders());
  }

  deleteMultipleSkills(ids: string[]): Observable<any> {
    return this.http.delete(environment.apiUrl + `/skills/bulk`, {
      ...this.sessionService.getAuthHeaders(),
      body: { ids }
    });
  }
  
  getSkillCategories(): Observable<any> {
    return this.http.get(environment.apiUrl + `/skill-categories`);
  }

  addSkillCategory(data: any): Observable<any> {
    return this.http.post(environment.apiUrl + '/skill-categories', data, this.sessionService.getAuthHeaders());
  }

  deleteSkillCategory(id: string): Observable<any> {
    return this.http.delete(environment.apiUrl + `/skill-categories/${id}`, this.sessionService.getAuthHeaders());
  }

  updateSkillCategory(id: string, data: any): Observable<any> {
    return this.http.put(environment.apiUrl + `/skill-categories/${id}`, data, this.sessionService.getAuthHeaders());
  }
}
