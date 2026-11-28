import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  private readonly apiUrl: string = `${environment.apiUrl}/services`;
  sessionService = inject(SessionService);
  constructor(private http: HttpClient) { }

  // GET /api/services
  getServices(page: number = 1, limit: number = 5, search: string = ''): Observable<any> {
    let url = `${this.apiUrl}/all`;
    let params = `?page=${page}&limit=${limit}`;
    if (search) {
      params += `&search=${encodeURIComponent(search)}`;
    }
    return this.http.get(`${url}${params}`);
  }

  // GET /api/services/:id
  getServiceById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // POST /api/services
  addService(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  addMultipleServices(data: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk`, data);
  }

  // PUT /api/services/:id
  updateService(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // DELETE /api/services/:id
  deleteService(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // DELETE /api/services/bulk
  deleteMultipleServices(ids: string[]): Observable<any> {
    return this.http.delete(`${this.apiUrl}/bulk`, {
      body: { ids }
    });
  }
}
