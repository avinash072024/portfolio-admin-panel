import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Position {
  _id: string;
  actualPosition: string;
  technicalPosition: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PositionsResponse {
  success: boolean;
  message?: string;
  count?: number;
  positions?: Position[];
  position?: Position | null;
}

@Injectable({
  providedIn: 'root'
})
export class PositionsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/positions`;

  getPositions(): Observable<PositionsResponse> {
    return this.http.get<PositionsResponse>(this.apiUrl);
  }

  getActivePosition(): Observable<PositionsResponse> {
    return this.http.get<PositionsResponse>(`${this.apiUrl}/active`);
  }

  createPosition(
    data: Pick<Position, 'actualPosition' | 'technicalPosition'> & { isActive?: boolean }
  ): Observable<PositionsResponse> {
    return this.http.post<PositionsResponse>(this.apiUrl, data);
  }

  updatePosition(
    id: string,
    data: Partial<Pick<Position, 'actualPosition' | 'technicalPosition' | 'isActive'>>
  ): Observable<PositionsResponse> {
    return this.http.put<PositionsResponse>(`${this.apiUrl}/${id}`, data);
  }

  deletePosition(id: string): Observable<PositionsResponse> {
    return this.http.delete<PositionsResponse>(`${this.apiUrl}/${id}`);
  }
}
