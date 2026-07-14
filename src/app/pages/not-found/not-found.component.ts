import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {
  location = inject(Location);
  router = inject(Router);

  goToHome(): void {
    this.router.navigateByUrl('/home');
  }

  goToBack(): void {
    this.location.back();
  }
}
