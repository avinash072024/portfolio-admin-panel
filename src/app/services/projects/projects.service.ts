import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  // private cachedProjects$?: Observable<any>;
  sessionService = inject(SessionService);
  constructor(private http: HttpClient) { }

  // getProjects(): Observable<any> {
  //   if (!this.cachedProjects$) {
  //     this.cachedProjects$ = this.http.get(environment.apiUrl + '/projects').pipe(
  //       shareReplay({ bufferSize: 1, refCount: true, windowTime: 300000 }),
  //       catchError(err => {
  //         this.cachedProjects$ = undefined;
  //         return throwError(() => err);
  //       })
  //     );
  //   }
  //   return this.cachedProjects$;
  // }

  getProjects(): Observable<any> {
    return this.http.get(environment.apiUrl + '/projects')
  }

  getAllProjects(page: number = 1, limit: number = 5, search: string = ''): Observable<any> {
    let url = `${environment.apiUrl}/projects/all`;
    let params = `?page=${page}&limit=${limit}`;
    if (search) {
      params += `&search=${encodeURIComponent(search)}`;
    }
    return this.http.get(`${url}${params}`);
  }

  getProjectById(id: string): Observable<any> {
    return this.http.get(environment.apiUrl + `/projects/${id}`);
  }

  addProject(data: any): Observable<any> {
    let image: string | null = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800';
    data.image = data.image || image;
    return this.http.post(environment.apiUrl + '/projects', data, this.sessionService.getAuthHeaders());
  }

  updateProject(id: string, data: any): Observable<any> {
    return this.http.put(environment.apiUrl + `/projects/${id}`, data, this.sessionService.getAuthHeaders());
  }

  deleteProject(id: string): Observable<any> {
    return this.http.delete(environment.apiUrl + `/projects/${id}`, this.sessionService.getAuthHeaders());
  }

  deleteMultipleProjects(ids: string[]): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/projects/bulk`, { ...this.sessionService.getAuthHeaders(), body: { ids } });
  }

  updateProjectStatus(id: string, isActive: boolean): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/projects/${id}/status`, { isActive }, this.sessionService.getAuthHeaders());
  }







  getProjectCategories(): Observable<any> {
    return this.http.get(environment.apiUrl + `/project-categories`);
  }

  addProjectCategory(data: any): Observable<any> {
    return this.http.post(environment.apiUrl + '/project-categories', data, this.sessionService.getAuthHeaders());
  }

  deleteProjectCategory(id: string): Observable<any> {
    return this.http.delete(environment.apiUrl + `/project-categories/${id}`, this.sessionService.getAuthHeaders());
  }

  updateProjectCategory(id: string, data: any): Observable<any> {
    return this.http.put(environment.apiUrl + `/project-categories/${id}`, data, this.sessionService.getAuthHeaders());
  }

  // private invalidateCache() {
  //   this.cachedProjects$ = undefined;
  // }

}
