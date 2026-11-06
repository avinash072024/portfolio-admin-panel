import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, HostListener, inject, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FooterComponent } from "../../components/footer/footer.component";
import { HeaderComponent } from '../../components/header/header.component';
import { SessionService } from '../../services/session/session.service';

declare var $: any;

interface NavigationLink {
  label: string;
  path: string;
  icon: string;
}

interface NavigationSection {
  label: string;
  links: NavigationLink[];
}

@Component({
  selector: 'app-layout',
  imports: [AsyncPipe, RouterOutlet, RouterLink, RouterLinkActive, HeaderComponent, FooterComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnDestroy {
  isSidebarOpen = false;
  showScrollTop = false;
  openSection: string | null = null;
  readonly sessionService = inject(SessionService);

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private previousBodyOverflow: string | null = null;

  constructor() {
    this.openSection = this.getActiveSection(this.router.url);
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(event => this.openSection = this.getActiveSection(event.urlAfterRedirects));
  }

  navSections: NavigationSection[] = [
    {
      label: 'Overview',
      links: [{ label: 'Dashboard', path: '/home', icon: 'bi bi-house-door' }]
    },
    {
      label: 'Manage content',
      links: [
        { label: 'About', path: '/about', icon: 'bi bi-person-vcard' },
        { label: 'Services', path: '/services', icon: 'bi bi-boxes' },
        { label: 'Projects', path: '/projects', icon: 'bi bi-kanban' },
        { label: 'Skills', path: '/skills', icon: 'bi bi-lightning-charge' },
        { label: 'Contact', path: '/contact', icon: 'bi bi-envelope' }
      ]
    },
    {
      label: 'Insights & tools',
      links: [
        { label: 'Website visitors', path: '/website-visitor', icon: 'bi bi-graph-up-arrow' },
        { label: 'Feedback', path: '/feedback', icon: 'bi bi-chat-square-text' },
        { label: 'Data backup', path: '/data-backup', icon: 'bi bi-cloud-arrow-down' },
        { label: 'Cover letter', path: '/cover-letter', icon: 'bi bi-file-earmark-richtext' }
      ]
    },
    {
      label: 'Account',
      links: [{ label: 'Reset password', path: '/reset-password', icon: 'bi bi-shield-lock' }]
    }
  ];

  toggleSidebar(): void {
    if (window.matchMedia('(max-width: 991.98px)').matches) {
      this.isSidebarOpen = !this.isSidebarOpen;
      this.updateBodyScrollLock();
    }
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
    this.updateBodyScrollLock();
  }

  toggleSection(sectionLabel: string): void {
    this.openSection = this.openSection === sectionLabel ? null : sectionLabel;
  }

  logout(): void {
    this.sessionService.logout();
    $('#LogoutStaticBackdrop').modal('hide');
    this.router.navigateByUrl('/login');
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (!window.matchMedia('(max-width: 991.98px)').matches) {
      this.closeSidebar();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeSidebar();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.showScrollTop = window.scrollY > 320;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    this.restoreBodyScroll();
  }

  private getActiveSection(url: string): string | null {
    const path = url.split(/[?#]/)[0].replace(/\/+$/, '') || '/home';
    return this.navSections.find(section =>
      section.links.some(link => path === link.path || path.startsWith(`${link.path}/`))
    )?.label ?? null;
  }

  private updateBodyScrollLock(): void {
    const shouldLock = this.isSidebarOpen && window.matchMedia('(max-width: 991.98px)').matches;
    if (shouldLock) {
      if (this.previousBodyOverflow === null) {
        this.previousBodyOverflow = document.body.style.overflow;
      }
      document.body.style.overflow = 'hidden';
    } else {
      this.restoreBodyScroll();
    }
  }

  private restoreBodyScroll(): void {
    if (this.previousBodyOverflow !== null) {
      document.body.style.overflow = this.previousBodyOverflow;
      this.previousBodyOverflow = null;
    }
  }
}
