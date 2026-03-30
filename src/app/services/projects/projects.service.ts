import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  constructor(private http: HttpClient) { }

  getProjects(): Observable<any> {
    return this.http.get(environment.apiUrl + '/projects');
  }

  getAllProjects(page: number = 1, limit: number = 5): Observable<any> {
    const params = `?page=${page}&limit=${limit}`;
    return this.http.get(`${environment.apiUrl}/projects${params}`);
  }

  getProjectById(id: string): Observable<any> {
    return this.http.get(environment.apiUrl + `/projects/${id}`);
  }

  addProject(data: any): Observable<any> {
    return this.http.post(environment.apiUrl + '/projects', data);
  }

  updateProject(id: string, data: any): Observable<any> {
    return this.http.put(environment.apiUrl + `/projects/${id}`, data);
  }

  deleteProject(id: string): Observable<any> {
    return this.http.delete(environment.apiUrl + `/projects/${id}`)
  }

}
