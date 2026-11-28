import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionService } from '../session/session.service';
import { Constants } from '../../models/constants';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private readonly apiUrl1: string = `${environment.apiUrl}/projects`;
  private readonly apiUrl2: string = `${environment.apiUrl}/project-categories`;
  sessionService = inject(SessionService);
  constructor(private http: HttpClient) { }

  getProjects(): Observable<any> {
    return this.http.get(this.apiUrl1)
  }

  getProjectsAll(): Observable<any> {
    return this.http.get(`${this.apiUrl1}/all`)
  }

  getAllProjects(page: number = 1, limit: number = 5, search: string = ''): Observable<any> {
    let url = `${this.apiUrl1}/all`;
    let params = `?page=${page}&limit=${limit}`;
    if (search) {
      params += `&search=${encodeURIComponent(search)}`;
    }
    return this.http.get(`${url}${params}`);
  }

  getProjectById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl1}/${id}`);
  }

  addProject(data: any): Observable<any> {
    let image: string | null = Constants.PROJECT_IMAGE_URL;
    data.image = data.image || image;
    return this.http.post(this.apiUrl1, data);
  }

  addMultipleProjects(data: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl1}/bulk`, data);
  }

  updateProject(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl1}/${id}`, data);
  }

  deleteProject(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl1}/${id}`);
  }

  deleteMultipleProjects(ids: string[]): Observable<any> {
    return this.http.delete(`${this.apiUrl1}/bulk`, { body: { ids } });
  }

  updateProjectStatus(id: string, isActive: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl1}/${id}/status`, { isActive });
  }

  // project categories
  getProjectCategories(): Observable<any> {
    return this.http.get(this.apiUrl2);
  }

  addProjectCategory(data: any): Observable<any> {
    return this.http.post(this.apiUrl2, data);
  }

  deleteProjectCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl2}/${id}`);
  }

  updateProjectCategory(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl2}/${id}`, data);
  }

}
