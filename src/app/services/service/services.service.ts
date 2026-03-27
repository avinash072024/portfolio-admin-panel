import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {

  constructor(private http: HttpClient) { }

  // GET /api/services
  getServices(page: number = 1, limit: number = 5): Observable<any> {
    const params = `?page=${page}&limit=${limit}`;
    return this.http.get(`${environment.apiUrl}/services${params}`);
  }

  // GET /api/services/:id
  getServiceById(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/services/${id}`);
  }

  // POST /api/services
  addService(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/services`, data);
  }

  // PUT /api/services/:id
  updateService(id: string, data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/services/${id}`, data);
  }

  // DELETE /api/services/:id
  deleteService(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/services/${id}`);
  }
}

