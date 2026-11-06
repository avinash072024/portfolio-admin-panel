import { Component, DestroyRef, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ThemeTogglerComponent } from '../theme-toggler/theme-toggler.component';

interface PageRoute {
  label: string;
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
    { label: 'Dashboard', path: '/home' },
    { label: 'About', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Projects', path: '/projects' },
    { label: 'Skills', path: '/skills' },
    { label: 'Contact', path: '/contact' },
    { label: 'Website visitors', path: '/website-visitor' },
    { label: 'Feedback', path: '/feedback' },
    { label: 'Cover letter', path: '/cover-letter' },
    { label: 'Data backup', path: '/data-backup' },
    { label: 'Reset password', path: '/reset-password' }
  ];

  readonly currentPage = signal(this.getCurrentPage(this.router.url));

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(event => this.currentPage.set(this.getCurrentPage(event.urlAfterRedirects)));
  }

  private getCurrentPage(url: string): string {
    const path = url.split(/[?#]/)[0].replace(/\/+$/, '') || '/home';
    const match = this.pageRoutes.find(link => path === link.path || path.startsWith(`${link.path}/`));
    if (!match) return 'Dashboard';
    if (path.includes('/add')) return `Add ${match.label.replace(/s$/, '')}`;
    if (path.includes('/edit')) return `Edit ${match.label.replace(/s$/, '')}`;
    return match.label;
  }
}
