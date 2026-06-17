import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ResumesService {
  private cachedResumes$?: Observable<any>;

  constructor(private http: HttpClient) { }

  getResumes(): Observable<any> {
    if (!this.cachedResumes$) {
      this.cachedResumes$ = this.http.get(environment.apiUrl + '/resumes').pipe(
        shareReplay({ bufferSize: 1, refCount: true, windowTime: 300000 }),
        catchError(err => {
          this.cachedResumes$ = undefined;
          return throwError(() => err);
        })
      );
    }
    return this.cachedResumes$;
  }

  getAllResumes(page: number = 1, limit: number = 5, search: string = ''): Observable<any> {
    let url = `${environment.apiUrl}/resumes`;
    let params = `?page=${page}&limit=${limit}`;
    if (search) {
      params += `&search=${encodeURIComponent(search)}`;
    }
    return this.http.get(`${url}${params}`);
  }

  getResumeById(id: string): Observable<any> {
    return this.http.get(environment.apiUrl + `/resumes/${id}`);
  }

  uploadResume(data: FormData): Observable<any> {
    return this.http.post(environment.apiUrl + '/resumes', data).pipe(
      tap(() => this.invalidateCache())
    );
  }

  updateResume(id: string, data: FormData): Observable<any> {
    return this.http.put(environment.apiUrl + `/resumes/${id}`, data).pipe(
      tap(() => this.invalidateCache())
    );
  }

  deleteResume(id: string): Observable<any> {
    return this.http.delete(environment.apiUrl + `/resumes/${id}`).pipe(
      tap(() => this.invalidateCache())
    );
  }

  private invalidateCache() {
    this.cachedResumes$ = undefined;
  }
}
