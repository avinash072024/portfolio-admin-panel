import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class VisitorService {
  constructor(private http: HttpClient) { }

  getVisitor(): Observable<any> {
    return this.http.get(environment.apiUrl + '/visitor/all');
  }
}
