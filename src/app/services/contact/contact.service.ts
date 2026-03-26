import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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

  // private apiUrl = `${environment.apiUrl}/contact`;

  getContact(): Observable<{ success: boolean; contact: ContactInfo }> {
    return this.http.get<{ success: boolean; contact: ContactInfo }>(`${environment.apiUrl}/contact`);
  }

  updateContact(contactData: Partial<ContactInfo>): Observable<{ success: boolean; message: string; contact: ContactInfo }> {
    return this.http.post<{ success: boolean; message: string; contact: ContactInfo }>(`${environment.apiUrl}/contact`, contactData);
  }
}
