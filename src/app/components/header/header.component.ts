import { Component, DestroyRef, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ThemeTogglerComponent } from '../theme-toggler/theme-toggler.component';

interface PageRoute {
  menu: string;
  submenu: string;
  path: string;
}

@Component({
  selector: 'app-header',
  imports: [ThemeTogglerComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  @Output() menuToggle = new EventEmitter<void>();

  private readonly pageRoutes: PageRoute[] = [
    { menu: 'Overview', submenu: 'Dashboard', path: '/home' },
    { menu: 'Manage content', submenu: 'About', path: '/about' },
    { menu: 'Manage content', submenu: 'Services', path: '/services' },
    { menu: 'Manage content', submenu: 'Projects', path: '/projects' },
    { menu: 'Manage content', submenu: 'Skills', path: '/skills' },
    { menu: 'Manage content', submenu: 'Contact', path: '/contact' },
    { menu: 'Insights & tools', submenu: 'Website visitors', path: '/website-visitor' },
    { menu: 'Insights & tools', submenu: 'Feedback', path: '/feedback' },
    { menu: 'Insights & tools', submenu: 'Cover letter', path: '/cover-letter' },
    { menu: 'Insights & tools', submenu: 'Data backup', path: '/data-backup' },
    { menu: 'Insights & tools', submenu: 'Data restore', path: '/data-restore' },
    { menu: 'Account', submenu: 'Reset password', path: '/reset-password' }
  ];

  readonly currentPage = signal(this.getCurrentPage(this.router.url));
  readonly currentMenu = signal(this.getCurrentMenu(this.router.url));

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(event => {
        this.currentPage.set(this.getCurrentPage(event.urlAfterRedirects));
        this.currentMenu.set(this.getCurrentMenu(event.urlAfterRedirects));
      });
  }

  private getCurrentPage(url: string): string {
    const path = url.split(/[?#]/)[0].replace(/\/+$/, '') || '/home';
    const match = this.pageRoutes.find(link => path === link.path || path.startsWith(`${link.path}/`));
    if (!match) return 'Dashboard';
    if (path.includes('/add')) return `Add ${match.submenu.replace(/s$/, '')}`;
    if (path.includes('/edit')) return `Edit ${match.submenu.replace(/s$/, '')}`;
    return match.submenu;
  }

  private getCurrentMenu(url: string): string {
    const path = url.split(/[?#]/)[0].replace(/\/+$/, '') || '/home';
    const match = this.pageRoutes.find(link => path === link.path || path.startsWith(`${link.path}/`));
    if (!match) return 'Overview';
    return match.menu;
  }
}
