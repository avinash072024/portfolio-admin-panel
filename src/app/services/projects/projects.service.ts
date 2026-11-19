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
  sessionService = inject(SessionService);
  constructor(private http: HttpClient) { }

  // getProjects(): Observable<any> {
  //   return this.http.get(environment.apiUrl + '/projects')
  // }

  // getProjectsAll(): Observable<any> {
  //   return this.http.get(environment.apiUrl + '/projects/all')
  // }

  // getAllProjects(page: number = 1, limit: number = 5, search: string = ''): Observable<any> {
  //   let url = `${environment.apiUrl}/projects/all`;
  //   let params = `?page=${page}&limit=${limit}`;
  //   if (search) {
  //     params += `&search=${encodeURIComponent(search)}`;
  //   }
  //   return this.http.get(`${url}${params}`);
  // }

  // getProjectById(id: string): Observable<any> {
  //   return this.http.get(environment.apiUrl + `/projects/${id}`);
  // }

  // addProject(data: any): Observable<any> {
  //   let image: string | null = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800';
  //   data.image = data.image || image;
  //   return this.http.post(environment.apiUrl + '/projects', data,);
  // }

  // addMultipleProjects(data: any[]): Observable<any> {
  //   return this.http.post(environment.apiUrl + '/projects/bulk', data,);
  // }

  // updateProject(id: string, data: any): Observable<any> {
  //   return this.http.put(environment.apiUrl + `/projects/${id}`, data,);
  // }

  // deleteProject(id: string): Observable<any> {
  //   return this.http.delete(environment.apiUrl + `/projects/${id}`,);
  // }

  // deleteMultipleProjects(ids: string[]): Observable<any> {
  //   return this.http.delete(`${environment.apiUrl}/projects/bulk`, { ...this.sessionService.getAuthHeaders(), body: { ids } });
  // }

  // updateProjectStatus(id: string, isActive: boolean): Observable<any> {
  //   return this.http.patch(`${environment.apiUrl}/projects/${id}/status`, { isActive },);
  // }







  // getProjectCategories(): Observable<any> {
  //   return this.http.get(environment.apiUrl + `/project-categories`);
  // }

  // addProjectCategory(data: any): Observable<any> {
  //   return this.http.post(environment.apiUrl + '/project-categories', data,);
  // }

  // deleteProjectCategory(id: string): Observable<any> {
  //   return this.http.delete(environment.apiUrl + `/project-categories/${id}`,);
  // }

  // updateProjectCategory(id: string, data: any): Observable<any> {
  //   return this.http.put(environment.apiUrl + `/project-categories/${id}`, data,);
  // }



  getProjects(): Observable<any> {
    return this.http.get(environment.apiUrl + '/projects')
  }

  getProjectsAll(): Observable<any> {
    return this.http.get(environment.apiUrl + '/projects/all')
  }

  getAllProjects(page: number = 1, limit: number = 5, search: string = ''): Observable<any> {
    let url = `${environment.apiUrl}/projects/all`;
    let params = `?page=${page}&limit=${limit}`;
    if (search) {
      params += `&search=${encodeURIComponent(search)}`;
    }
    return this.http.get(`${url}${params}`);
  }

  getProjectById(id: string): Observable<any> {
    return this.http.get(environment.apiUrl + `/projects/${id}`);
  }

  addProject(data: any): Observable<any> {
    let image: string | null = Constants.PROJECT_IMAGE_URL;
    data.image = data.image || image;
    return this.http.post(environment.apiUrl + '/projects', data);
  }

  addMultipleProjects(data: any[]): Observable<any> {
    return this.http.post(environment.apiUrl + '/projects/bulk', data);
  }

  updateProject(id: string, data: any): Observable<any> {
    return this.http.put(environment.apiUrl + `/projects/${id}`, data);
  }

  deleteProject(id: string): Observable<any> {
    return this.http.delete(environment.apiUrl + `/projects/${id}`);
  }

  deleteMultipleProjects(ids: string[]): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/projects/bulk`, { body: { ids } });
  }

  updateProjectStatus(id: string, isActive: boolean): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/projects/${id}/status`, { isActive });
  }

  // project categories
  getProjectCategories(): Observable<any> {
    return this.http.get(environment.apiUrl + `/project-categories`);
  }

  addProjectCategory(data: any): Observable<any> {
    return this.http.post(environment.apiUrl + '/project-categories', data);
  }

  deleteProjectCategory(id: string): Observable<any> {
    return this.http.delete(environment.apiUrl + `/project-categories/${id}`);
  }

  updateProjectCategory(id: string, data: any): Observable<any> {
    return this.http.put(environment.apiUrl + `/project-categories/${id}`, data);
  }

}
