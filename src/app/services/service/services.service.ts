import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  private cachedServices$?: Observable<any>;

  constructor(private http: HttpClient) { }

  // GET /api/services
  getServices(page: number = 1, limit: number = 5, search: string = ''): Observable<any> {
    let url = `${environment.apiUrl}/services`;
    let params = `?page=${page}&limit=${limit}`;
    if (search) {
      params += `&search=${encodeURIComponent(search)}`;
    }
    return this.http.get(`${url}${params}`);
  }

  // GET /api/services/:id
  getServiceById(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/services/${id}`);
  }

  // POST /api/services
  addService(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/services`, data).pipe(
      tap(() => this.invalidateCache())
    );
  }

  // PUT /api/services/:id
  updateService(id: string, data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/services/${id}`, data).pipe(
      tap(() => this.invalidateCache())
    );
  }

  // DELETE /api/services/:id
  deleteService(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/services/${id}`).pipe(
      tap(() => this.invalidateCache())
    );
  }

  private invalidateCache() {
    this.cachedServices$ = undefined;
  }
}

