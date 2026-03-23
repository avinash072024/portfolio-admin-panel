import { effect, inject, Injectable, Renderer2, RendererFactory2, signal } from '@angular/core';
import { Constants } from '../../models/constants';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  theme = signal(localStorage.getItem(Constants.THEME_KEY) || 'light');
  skin = signal(localStorage.getItem(Constants.SKIN_KEY) || 'default-blue');
  sessionService = inject(SessionService);

  constructor() {
    // Automatically update DOM and localStorage when signals change
    effect(() => {
      document.documentElement.setAttribute('data-bs-theme', this.theme());
      document.documentElement.setAttribute('data-skin', this.skin());
      localStorage.setItem(Constants.THEME_KEY, this.theme());
      localStorage.setItem(Constants.SKIN_KEY, this.skin());
      // Update meta theme-color to match the current skin's primary color
      try {
        const style = getComputedStyle(document.documentElement);
        const primary = style.getPropertyValue('--bs-primary')?.trim() || '';
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta && primary) {
          meta.setAttribute('content', primary);
        }
      } catch (e) {
        // ignore on server or if not available
      }
    });
  }

  toggleTheme(theme: string) {
    // this.theme.set(this.theme() === 'light' ? 'dark' : 'light');
    this.theme.set(theme);
    this.sessionService.setThemeSession(this.theme());
  }

  setSkin(color: string) {
    this.skin.set(color);
    this.sessionService.setSkinSession(this.skin())
  }
}
