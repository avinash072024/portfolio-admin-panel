import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private cachedProjects$?: Observable<any>;

  constructor(private http: HttpClient) { }

  getProjects(): Observable<any> {
    if (!this.cachedProjects$) {
      this.cachedProjects$ = this.http.get(environment.apiUrl + '/projects').pipe(
        shareReplay({ bufferSize: 1, refCount: true, windowTime: 300000 }),
        catchError(err => {
          this.cachedProjects$ = undefined;
          return throwError(() => err);
        })
      );
    }
    return this.cachedProjects$;
  }

  getAllProjects(page: number = 1, limit: number = 5): Observable<any> {
    const params = `?page=${page}&limit=${limit}`;
    return this.http.get(`${environment.apiUrl}/projects${params}`);
  }

  getProjectById(id: string): Observable<any> {
    return this.http.get(environment.apiUrl + `/projects/${id}`);
  }

  addProject(data: any): Observable<any> {
    return this.http.post(environment.apiUrl + '/projects', data).pipe(
      tap(() => this.invalidateCache())
    );
  }

  updateProject(id: string, data: any): Observable<any> {
    return this.http.put(environment.apiUrl + `/projects/${id}`, data).pipe(
      tap(() => this.invalidateCache())
    );
  }

  deleteProject(id: string): Observable<any> {
    return this.http.delete(environment.apiUrl + `/projects/${id}`).pipe(
      tap(() => this.invalidateCache())
    );
  }

  



  getProjectCategories(): Observable<any> {
    return this.http.get(environment.apiUrl + `/project-categories`);
  }

  addProjectCategory(data: any): Observable<any> {
    return this.http.post(environment.apiUrl + '/project-categories', data);
  }

  deleteProjectCategory(id: string): Observable<any> {
    return this.http.delete(environment.apiUrl + `/project-categories/${id}`);
  }

  updateProjectCategory(id: string, data: any): Observable<any> {
    return this.http.put(environment.apiUrl + `/project-categories/${id}`, data);
  }


  

  private invalidateCache() {
    this.cachedProjects$ = undefined;
  }

}
