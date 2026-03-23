import { Injectable } from '@angular/core';
import { Constants } from '../../models/constants';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

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
    localStorage.setItem(Constants.USER_DETAILS, user);
  }

  getUserSession(): void {
    localStorage.getItem(Constants.USER_DETAILS);
  }

  clearUserSession(): void {
    localStorage.removeItem(Constants.USER_DETAILS);
  }
}
