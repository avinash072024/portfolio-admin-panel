import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SessionService } from '../session/session.service';

export interface ContactInfo {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  resumeUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private http = inject(HttpClient);
  sessionService = inject(SessionService);

  getContact(): Observable<{ success: boolean; contact: ContactInfo }> {
    return this.http.get<{ success: boolean; contact: ContactInfo }>(environment.apiUrl + `/contact`);
  }

  updateContact(contactData: Partial<ContactInfo>): Observable<{ success: boolean; message: string; contact: ContactInfo }> {
    return this.http.post<{ success: boolean; message: string; contact: ContactInfo }>(`${environment.apiUrl}/contact`, contactData, this.sessionService.getAuthHeaders());
  }
}
