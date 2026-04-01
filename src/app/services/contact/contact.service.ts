import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

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
  private cachedContact$?: Observable<{ success: boolean; contact: ContactInfo }>;

  getContact(): Observable<{ success: boolean; contact: ContactInfo }> {
    if (!this.cachedContact$) {
      this.cachedContact$ = this.http.get<{ success: boolean; contact: ContactInfo }>(`${environment.apiUrl}/contact`).pipe(
        shareReplay({ bufferSize: 1, refCount: true, windowTime: 300000 }),
        catchError(err => {
          this.cachedContact$ = undefined;
          return throwError(() => err);
        })
      );
    }
    return this.cachedContact$;
  }

  updateContact(contactData: Partial<ContactInfo>): Observable<{ success: boolean; message: string; contact: ContactInfo }> {
    return this.http.post<{ success: boolean; message: string; contact: ContactInfo }>(`${environment.apiUrl}/contact`, contactData).pipe(
      tap(() => this.invalidateCache())
    );
  }

  private invalidateCache() {
    this.cachedContact$ = undefined;
  }
}
