import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private containerId = 'app-toast-container';

  showSuccess(message: string, timeout = 3000) {
    this.createToast(message, 'success', timeout);
  }

  showError(message: string, timeout = 4000) {
    this.createToast(message, 'danger', timeout);
  }

  private createToast(message: string, type: 'success' | 'danger', timeout: number) {
    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      container.style.position = 'fixed';
      container.style.top = '1rem';
      container.style.left = '50%';
      container.style.transform = 'translateX(-50%)';
      container.style.zIndex = '1080';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `alert alert-${type} shadow`;
    toast.style.marginBottom = '0.5rem';
    toast.style.minWidth = '300px';
    toast.setAttribute('role', 'alert');

    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.style.marginRight = '0.5rem';
    icon.style.fontWeight = '600';
    icon.textContent = type === 'success' ? '✓' : '✖';

    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(messageSpan);

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease';
      toast.style.opacity = '0';
      setTimeout(() => container?.removeChild(toast), 300);
    }, timeout);
  }
}
