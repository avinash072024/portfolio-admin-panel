import { Component, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import * as AOS from 'aos';
import { NgxSpinnerModule } from 'ngx-spinner';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService } from './services/theme/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'portfolio-admin-panel';
  private platformId = inject(PLATFORM_ID);
  private readonly themeService = inject(ThemeService);

  constructor(
    private router: Router
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && isPlatformBrowser(this.platformId)) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  ngOnInit() {
    AOS.init({
      duration: 1000,
      mirror: false,
      // easing: 'ease-in-out'
    });
  }

  // @HostListener('document:contextmenu', ['$event'])
  // onRightClick(event: MouseEvent) {
  //   event.preventDefault();
  // }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // // Disable Ctrl+C (Copy)
    // if (event.ctrlKey && event.key === 'c') {
    //   event.preventDefault();
    // }

    // // Disable Ctrl+P (Print)
    // if (event.ctrlKey && event.key === 'p') {
    //   event.preventDefault();
    // }

    // // Disable F12 (Inspect Element)
    // if (event.key === 'F12') {
    //   event.preventDefault();
    // }

    // // Disable Ctrl+Shift+I (Inspect Element)
    // if (event.ctrlKey && event.shiftKey && event.key === 'I') {
    //   event.preventDefault();
    // }

    // // Disable Ctrl+U (View Source)
    // if (event.ctrlKey && event.key === 'u') {
    //   event.preventDefault();
    // }
  }
}
