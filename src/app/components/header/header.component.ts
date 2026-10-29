import { Component, HostListener, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme/theme.service';
import { Constants } from '../../models/constants';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { ThemeTogglerComponent } from "../theme-toggler/theme-toggler.component";
import { SessionService } from '../../services/session/session.service';
declare var $: any;

interface Skins {
  id: number;
  name: string;
  class: string;
  hex: string;
}

interface NavLinks {
  id: number;
  label: string;
  path: string;
}

interface UserNavLinks {
  id: number;
  label: string;
  path: string;
  icon: string
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, TitleCasePipe, ThemeTogglerComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  themeService = inject(ThemeService);
  sessionService = inject(SessionService);
  router = inject(Router);
  isScrolled = signal(false);
  appName1: string = Constants.APP_NAME1;
  appName2: string = Constants.APP_NAME2;
  currentYear: number = new Date().getFullYear();

  skins: Skins[] = [
    { id: 1, name: 'Default Blue', class: 'default-blue', hex: '#0d6efd' },
    { id: 2, name: 'Emerald', class: 'emerald-green', hex: '#198754' },
    { id: 3, name: 'Purple', class: 'vibrant-purple', hex: '#6610f2' },
    { id: 4, name: 'Hot Pink', class: 'hot-pink', hex: '#d63384' },
    { id: 5, name: 'Sunset', class: 'sunset-orange', hex: '#fd7e14' },
    { id: 6, name: 'Cyan Wave', class: 'cyan-wave', hex: '#0dcaf0' },
    { id: 7, name: 'Crimson', class: 'crimson-red', hex: '#dc3545' }
  ];

  navLinks: NavLinks[] = [
    { id: 1, path: '/home', label: 'Home' },
    { id: 2, path: '/about', label: 'About' },
    { id: 3, path: '/services', label: 'Services' },
    { id: 4, path: '/projects', label: 'Projects' },
    { id: 5, path: '/skills', label: 'Skills' },
    { id: 6, path: '/contact', label: 'Contact' },
  ]

  userNavLinks: UserNavLinks[] = [
    { id: 1, path: '/reset-password', label: 'Reset Password', icon: 'bi bi-key me-2' },
    { id: 2, path: '/website-visitor', label: 'Website Visitor', icon: 'bi bi-globe me-2' },
    { id: 3, path: '/feedback', label: 'Feedback', icon: 'bi bi-chat-dots me-2' },
    { id: 4, path: '/cover-letter', label: 'Cover Letter', icon: 'bi bi-file-earmark-text me-2' },
    { id: 5, path: '/data-backup', label: 'Backup', icon: 'bi bi-file-earmark-arrow-down me-2' }
  ]

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 50);
  }

  redirectTo(url: string): void {
    this.router.navigateByUrl(url);
  }

  onResetPassword() {
    this.router.navigate(['/reset-password']);
  }

  onVisitors() {
    this.router.navigate(['/website-visitor']);
  }

  onFeedback() {
    this.router.navigate(['/feedback']);
  }

  onGenerateCoverLetter() {
    this.router.navigate(['/cover-letter']);
  }

  logout() {
    this.sessionService.logout();
    $('#LogoutStaticBackdrop').modal('hide');
    // this.toastr.success('Logout successfully');
    this.router.navigateByUrl('/login');
  }
}
