import { Component, HostListener, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme/theme.service';
import { Constants } from '../../models/constants';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { ThemeTogglerComponent } from "../theme-toggler/theme-toggler.component";

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, TitleCasePipe, ThemeTogglerComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  themeService = inject(ThemeService);
  router = inject(Router);
  isScrolled = signal(false);
  appName1: string = Constants.APP_NAME1;
  appName2: string = Constants.APP_NAME2;
  currentYear: number = new Date().getFullYear();

  skins = [
    { name: 'Default Blue', class: 'default-blue', hex: '#0d6efd' },
    { name: 'Emerald', class: 'emerald-green', hex: '#198754' },
    { name: 'Purple', class: 'vibrant-purple', hex: '#6610f2' },
    { name: 'Hot Pink', class: 'hot-pink', hex: '#d63384' },
    { name: 'Sunset', class: 'sunset-orange', hex: '#fd7e14' },
    { name: 'Cyan Wave', class: 'cyan-wave', hex: '#0dcaf0' },
    { name: 'Crimson', class: 'crimson-red', hex: '#dc3545' }
  ];

  navLinks = [
    { id: 1, path: '/home', label: 'Home' },
    { id: 2, path: '/about', label: 'About' },
    { id: 3, path: '/services', label: 'Services' },
    { id: 4, path: '/projects', label: 'Projects' },
    { id: 5, path: '/skills', label: 'Skills' },
    { id: 6, path: '/contact', label: 'Contact' },
  ]

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 50);
  }

  onSettings() {
    this.router.navigate(['/settings']);
  }

  onResetPassword() {
    this.router.navigate(['/reset-password']);
  }

  onLogout() {
    if (confirm('Logout from account?')) {
      // navigate to login or landing page; adapt if auth flow exists
      this.router.navigate(['/login']);
    }
  }
}
