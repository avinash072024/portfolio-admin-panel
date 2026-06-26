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

  /** Fetch all visitors without pagination (used for summary/count widgets) */
  getVisitor(): Observable<any> {
    return this.http.get(environment.apiUrl + '/visitor/all');
  }

  /**
   * Fetch visitors with optional pagination and/or date filtering.
   *
   * @param page  - Page number (1-based). Pass 0 / undefined to skip pagination.
   * @param limit - Page size.            Pass 0 / undefined to skip pagination.
   * @param date  - Optional date filter in YYYY-MM-DD format.
   */
  getAllVisitors(page: number = 1, limit: number = 5, date?: string): Observable<any> {
    const key = `${page}_${limit}_${date ?? ''}`;

    if (!this.cache.has(key)) {
      const queryParams: string[] = [];

      if (page && limit) {
        queryParams.push(`page=${page}`, `limit=${limit}`);
      }

      if (date) {
        queryParams.push(`date=${encodeURIComponent(date)}`);
      }

      const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
      const req$ = this.http.get(`${environment.apiUrl}/visitor/all${queryString}`);
      this.cache.set(key, req$);
    }

    return this.cache.get(key)!;
  }

  /** Clears the request cache (call before re-fetching after filter/page changes). */
  clearCache(): void {
    this.cache.clear();
  }


  /**
   * Convenience method — fetch all visitors for a specific date (no pagination).
   *
   * @param date - Date string in YYYY-MM-DD format.
   */
  getVisitorsByDate(date: string): Observable<any> {
    return this.getAllVisitors(0, 0, date);
  }

  deleteDuplicateVisitors(): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/visitor/duplicates`);
  }
}
