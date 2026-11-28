import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginResponse } from '../../models/user.model';
import { environment } from '../../../environments/environment';

export interface PasswordApiResponse {
  success: boolean;
  message?: string;
  data?: {
    verificationToken?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl: string = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) { }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, data);
  }

  verifyCurrentPassword(data: { email: string; oldPassword: string }): Observable<PasswordApiResponse> {
    return this.http.post<PasswordApiResponse>(`${this.apiUrl}/password/verify-current`, data);
  }

  changePassword(data: { email: string; verificationToken: string; newPassword: string }): Observable<PasswordApiResponse> {
    return this.http.post<PasswordApiResponse>(`${this.apiUrl}/password/change`, data);
  }

  sendPasswordResetOtp(data: { email: string }): Observable<PasswordApiResponse> {
    return this.http.post<PasswordApiResponse>(`${this.apiUrl}/password/otp/send`, data);
  }

  verifyPasswordResetOtp(data: { email: string; otp: string; newPassword: string }): Observable<PasswordApiResponse> {
    return this.http.post<PasswordApiResponse>(`${this.apiUrl}/password/otp/verify`, data);
  }
}
