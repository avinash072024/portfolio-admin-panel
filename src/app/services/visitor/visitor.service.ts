import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class VisitorService {
  private cache = new Map<string, Observable<any>>();

  constructor(private http: HttpClient) { }

  getVisitor(): Observable<any> {
    return this.http.get(environment.apiUrl + '/visitor/all');
  }

  getAllVisitors(page: number = 1, limit: number = 5): Observable<any> {
    const key = `${page}_${limit}`;
    if (!this.cache.has(key)) {
      const params = `?page=${page}&limit=${limit}`;
      const req$ = this.http.get(`${environment.apiUrl}/visitor/all${params}`);
      this.cache.set(key, req$);
    }
    return this.cache.get(key)!;
  }
}
