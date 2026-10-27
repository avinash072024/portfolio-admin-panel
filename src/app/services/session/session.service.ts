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

  private initializeCurrentUser(): void {
    const token = this.getCookie(Constants.token);
    if (token) {
      const decoded = this.decodeToken(token);
      if (decoded) {
        this.currentUserSubject.next(decoded);
      }
    }
  }

  private decodeToken(token: string): User | null {
    try {
      return jwtDecode<User>(token);
    } catch {
      return null;
    }
  }

  setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
  }

  // theme
  setThemeSession(theme: string): void {
    localStorage.setItem(Constants.THEME_KEY, theme);
  }

  getThemeSession(): void {
    localStorage.getItem(Constants.THEME_KEY);
  }

  clearThemeSession(): void {
    localStorage.removeItem(Constants.THEME_KEY);
  }

  // skin
  setSkinSession(skinColor: string): void {
    localStorage.setItem(Constants.SKIN_KEY, skinColor);
  }

  getSkinSession(): void {
    localStorage.getItem(Constants.SKIN_KEY);
  }

  clearSkinSession(): void {
    localStorage.removeItem(Constants.SKIN_KEY);
  }

  // user session
  setUserSession(user: any): void {
    try {
      localStorage.setItem(Constants.USER_DETAILS, JSON.stringify(user));
    } catch (e) {
      localStorage.setItem(Constants.USER_DETAILS, String(user));
    }
  }

  getUserSession(): any {
    const v = localStorage.getItem(Constants.USER_DETAILS);
    if (!v) return null;
    try {
      return JSON.parse(v);
    } catch (e) {
      return v;
    }
  }

  clearUserSession(): void {
    localStorage.removeItem(Constants.USER_DETAILS);
  }

  isAuthenticated(): boolean {
    return !!this.getUserSession();
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

  clearAuth(): void {
    this.deleteCookie(Constants.token);
    this.currentUserSubject.next(null);
  }

  logout(): void {
    if (this.isBrowser) {
      this.deleteCookie(Constants.token);
      this.clearSession();
    }
    this.currentUserSubject.next(null);
  }

  getAuthHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.getCookie(Constants.token) || ''}`
      })
    };
  }
}
