import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  private cachedResumes$?: Observable<any>;

  constructor(private http: HttpClient) { }

  getResumes(): Observable<any> {
    if (!this.cachedResumes$) {
      this.cachedResumes$ = this.http.get(environment.apiUrl + `/resumes`).pipe(
        shareReplay({ bufferSize: 1, refCount: true, windowTime: 300000 }),
        catchError(err => {
          this.cachedResumes$ = undefined;
          return throwError(() => err);
        })
      );
    }
    return this.cachedResumes$;
  }

  getResume(id: string): Observable<any> {
    return this.http.get(environment.apiUrl + `/resumes/${id}`);
  }

  addResume(formData: FormData): Observable<any> {
    return this.http.post(environment.apiUrl + `/resumes`, formData).pipe(
      tap(() => this.invalidateCache())
    );
  }

  updateResume(id: string, formData: FormData): Observable<any> {
    return this.http.put(environment.apiUrl + `/resumes/${id}`, formData).pipe(
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
