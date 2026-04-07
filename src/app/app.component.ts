import { Component, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import * as AOS from 'aos';
import { Constants } from './models/constants';
import { SessionService } from './services/session/session.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'portfolio-admin-panel';
  private permissionPrompted = false;

  theme = signal(localStorage.getItem(Constants.THEME_KEY) || 'light');
  skin = signal(localStorage.getItem(Constants.SKIN_KEY) || 'default-blue');

  constructor(
    private sessionService: SessionService,
    private toastr: ToastrService,
    private router: Router
  ) {
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

  ngOnInit() {
    AOS.init({
      duration: 1000,
      mirror: false
    });
  }
}
