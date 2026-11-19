import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Constants } from '../../models/constants';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { User } from '../../models/user.model';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private isBrowser: boolean;
  private platformId = inject(PLATFORM_ID);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initializeCurrentUser();
  }

  initializeCurrentUser(): void {
    const token = this.getCookie(Constants.token);
    if (token) {
      const decoded = this.decodeToken(token);
      if (decoded) {
        this.currentUserSubject.next(decoded);
      }
    }
  }

  decodeToken(token: string): User | null {
    try {
      return jwtDecode<User>(token);
    } catch {
      return null;
    }
  }

  clearSession(): void {
    if (this.isBrowser) {
      localStorage.clear();
    }
  }

  // cookies
  setCookie(name: string, value: string, days = 30): void {
    if (!this.isBrowser) return;

    const expires = new Date();
    expires.setDate(expires.getDate() + days);

    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;

    if (name === Constants.token) {
      const decoded = this.decodeToken(value);
      this.currentUserSubject.next(decoded);
    }
  }

  getCookie(name: string): string | null {
    if (!this.isBrowser) return null;

    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();

      if (cookie.startsWith(nameEQ)) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
  }

  deleteCookie(name: string): void {
    if (!this.isBrowser) return;

    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    if (name === Constants.token) {
      this.currentUserSubject.next(null);
    }
  }

  logout(): void {
    if (this.isBrowser) {
      this.deleteCookie(Constants.token);
      this.clearSession();
    }
    this.currentUserSubject.next(null);
  }

  // getAuthHeaders() {
  //   return {
  //     headers: new HttpHeaders({
  //       Authorization: `Bearer ${this.getCookie(Constants.token) || ''}`
  //     })
  //   };
  // }
}
