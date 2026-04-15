import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  constructor(private http: HttpClient) { }

  getFeedbacks(): Observable<any> {
    return this.http.get(environment.apiUrl + '/feedback');
  }

  getAllFeedbacks(page: number = 1, limit: number = 5, search: string = ''): Observable<any> {
    let url = `${environment.apiUrl}/feedback?page=${page}&limit=${limit}`;
    if (search?.trim()) {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    return this.http.get(url);
  }

  updateFeedbackVerified(id: string, verified: boolean): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/feedback/${id}/verified`, { verified });
  }

  deleteFeedback(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/feedback/${id}`);
  }
}
