import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root'
})
export class VisitorService {
  // private cache = new Map<string, Observable<any>>();
  sessionService = inject(SessionService);
  constructor(private http: HttpClient) { }

  /** Fetch all visitors without pagination (used for summary/count widgets) */
  getVisitor(): Observable<any> {
    return this.http.get(environment.apiUrl + '/visitor/all', this.sessionService.getAuthHeaders());
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
    return this.http.get(`${environment.apiUrl}/visitor/all${queryString}`, this.sessionService.getAuthHeaders());
  }

  getVisitorsByDate(date: string): Observable<any> {
    return this.getAllVisitors(0, 0, date);
  }

  deleteDuplicateVisitors(): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/visitor/duplicates`, this.sessionService.getAuthHeaders());
  }
}
