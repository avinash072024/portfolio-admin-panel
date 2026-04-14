import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor(private http: HttpClient) { }

  getAllEmail(page: number = 1, limit: number = 5, search: string = ''): Observable<any> {
    let url = `${environment.apiUrl}/emails?page=${page}&limit=${limit}`;
    if (search?.trim()) {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    return this.http.get(url);
  }

  getAllEmails(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/emails`);
  }

  getAvatar(name: string): string {
    const safeName = name || 'User';
    const formattedName = safeName.trim().replace(/ /g, '+');
    return `https://ui-avatars.com/api/?name=${formattedName}&background=0D8ABC&color=fff&rounded=true&size=24`;
  }

  deleteEmail(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/emails/${id}`);
  }
}
