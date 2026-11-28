import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root'
})
export class VisitorService {
  private readonly apiUrl: string = `${environment.apiUrl}/visitor`;
  sessionService = inject(SessionService);
  constructor(private http: HttpClient) { }

  getVisitor(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`);
  }

  addMultipleVisitors(data: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk`, data);
  }

  getAllVisitors(page: number = 1, limit: number = 5, date?: string): Observable<any> {
    const queryParams: string[] = [];

    if (page && limit) {
      queryParams.push(`page=${page}`, `limit=${limit}`);
    }

    if (date) {
      queryParams.push(`date=${encodeURIComponent(date)}`);
    }

    const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
    return this.http.get(`${this.apiUrl}/all${queryString}`);
  }

  getVisitorsByDate(date: string): Observable<any> {
    return this.getAllVisitors(0, 0, date);
  }

  deleteDuplicateVisitors(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/duplicates`);
  }
}
