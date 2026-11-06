import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FooterComponent } from "../../components/footer/footer.component";
import { HeaderComponent } from '../../components/header/header.component';

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
  imports: [RouterOutlet, RouterLink, RouterLinkActive, HeaderComponent, FooterComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  isSidebarOpen = false;
  showScrollTop = false;

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
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.showScrollTop = window.scrollY > 320;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
