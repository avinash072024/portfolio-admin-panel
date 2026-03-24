import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SkillsService {

  constructor(private http: HttpClient) { }

  getAllSkills(page: number = 1, limit: number = 5): Observable<any> {
    const params = `?page=${page}&limit=${limit}`;
    return this.http.get(`${environment.apiUrl}/skills${params}`);
  }
}
