import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private readonly http = inject(HttpClient);
  private readonly swPush = inject(SwPush);
  private foregroundHandlerAttached = false;

  get isPushSupported(): boolean {
    return this.swPush.isEnabled && typeof Notification !== 'undefined';
  }

  get notificationPermission(): NotificationPermission {
    if (typeof Notification === 'undefined') {
      return 'denied';
    }
    return Notification.permission;
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof Notification === 'undefined') {
      return 'denied';
    }
    return Notification.requestPermission();
  }

  initializeForegroundVisitorNotificationHandler(): void {
    if (!this.isPushSupported || this.foregroundHandlerAttached) {
      return;
    }

    this.foregroundHandlerAttached = true;
    this.swPush.messages.subscribe(async () => {
      if (this.notificationPermission !== 'granted' || !('serviceWorker' in navigator)) {
        return;
      }

      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        return;
      }

      await registration.showNotification('New Visitor', {
        body: 'Website visited by new visitor',
        icon: 'icons/icon-192x192.png',
        badge: 'icons/icon-72x72.png'
      });
    });
  }

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.isPushSupported) {
      return null;
    }
    return firstValueFrom(this.swPush.subscription);
  }

  async subscribeToVisitorNotifications(): Promise<boolean> {
    if (!this.isPushSupported) {
      return false;
    }

    const vapidPublicKey = environment.pushVapidPublicKey?.trim();
    if (!vapidPublicKey) {
      throw new Error('Missing VAPID public key. Set pushVapidPublicKey in environment files.');
    }

    const existingSubscription = await firstValueFrom(this.swPush.subscription);
    const subscription = existingSubscription ?? await this.swPush.requestSubscription({
      serverPublicKey: vapidPublicKey
    });

    await firstValueFrom(
      this.http.post(`${environment.apiUrl}${environment.pushSubscribeEndpoint}`, {
        subscription
      })
    );

    return true;
  }

  async unsubscribeFromVisitorNotifications(): Promise<boolean> {
    if (!this.isPushSupported) {
      return false;
    }

    const subscription = await firstValueFrom(this.swPush.subscription);
    if (!subscription) {
      return true;
    }

    await firstValueFrom(
      this.http.post(`${environment.apiUrl}${environment.pushUnsubscribeEndpoint}`, {
        endpoint: subscription.endpoint
      })
    );

    await subscription.unsubscribe();
    return true;
  }
}
