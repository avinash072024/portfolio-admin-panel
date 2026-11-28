import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private readonly apiUrl: string = `${environment.apiUrl}/feedback`;
  sessionService = inject(SessionService);
  constructor(private http: HttpClient) { }

  getFeedbacks(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  addMultipleFeedbacks(data: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk`, data);
  }

  getAllFeedbacks(page: number = 1, limit: number = 5, search: string = ''): Observable<any> {
    let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
    if (search?.trim()) {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    return this.http.get(url);
  }

  updateFeedbackVerified(id: string, verified: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/verified`, { verified });
  }

  deleteFeedback(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  deleteMultipleFeedbacks(ids: string[]): Observable<any> {
    return this.http.delete(`${this.apiUrl}/bulk`, { body: { ids } });
  }

  updateMultipleFeedbackVerified(ids: string[], verified: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/bulk/verified`, { ids, verified });
  }
}
