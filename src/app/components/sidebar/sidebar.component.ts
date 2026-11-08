import { AsyncPipe } from '@angular/common';
import { Component, HostListener, inject, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
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
  selector: 'app-sidebar',
  imports: [AsyncPipe, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnDestroy {
  isOpen = false;
  readonly sessionService = inject(SessionService);

  private readonly router = inject(Router);
  private previousBodyOverflow: string | null = null;

  readonly navSections: NavigationSection[] = [
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
      this.isOpen = !this.isOpen;
      this.updateBodyScrollLock();
    }
  }

  closeSidebar(): void {
    this.isOpen = false;
    this.updateBodyScrollLock();
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

  ngOnDestroy(): void {
    this.restoreBodyScroll();
  }

  private updateBodyScrollLock(): void {
    const shouldLock = this.isOpen && window.matchMedia('(max-width: 991.98px)').matches;
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
