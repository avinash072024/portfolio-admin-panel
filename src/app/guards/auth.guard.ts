import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SessionService } from '../services/session/session.service';
import { Constants } from '../models/constants';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const sessionService = inject(SessionService);
  // const token = localStorage.getItem('token');

  // if (token) {
  //   return true; // Token exists, proceed securely
  // }
  
  const token = sessionService.getCookie(Constants.token);
  if (token) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
