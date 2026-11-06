import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Constants } from '../../models/constants';

type ThemeMode = 'light' | 'dark';

const SKIN_NAMES = [
  'default-blue',
  'emerald-green',
  'vibrant-purple',
  'hot-pink',
  'sunset-orange',
  'cyan-wave',
  'crimson-red'
];

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  theme = signal<ThemeMode>(this.readTheme());
  skin = signal(this.readSkin());

  constructor() {
    effect(() => {
      if (!this.isBrowser) return;

      document.documentElement.setAttribute('data-bs-theme', this.theme());
      document.documentElement.setAttribute('data-skin', this.skin());
      localStorage.setItem(Constants.THEME_KEY, this.theme());
      localStorage.setItem(Constants.SKIN_KEY, this.skin());

      const primary = getComputedStyle(document.documentElement).getPropertyValue('--bs-primary').trim();
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta && primary) {
        meta.setAttribute('content', primary);
      }
    });
  }

  toggleTheme(theme: ThemeMode): void {
    this.theme.set(theme);
  }

  setSkin(color: string): void {
    if (SKIN_NAMES.includes(color)) this.skin.set(color);
  }

  private readTheme(): ThemeMode {
    return this.readPreference(Constants.THEME_KEY, 'light') === 'dark' ? 'dark' : 'light';
  }

  private readSkin(): string {
    const savedSkin = this.readPreference(Constants.SKIN_KEY, 'default-blue');
    return SKIN_NAMES.includes(savedSkin) ? savedSkin : 'default-blue';
  }

  private readPreference(key: string, fallback: string): string {
    if (!this.isBrowser) return fallback;
    return localStorage.getItem(key) || fallback;
  }
}
