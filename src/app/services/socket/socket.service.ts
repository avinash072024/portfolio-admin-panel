import { Injectable } from '@angular/core';
import { filter, fromEvent, merge, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    const baseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
    this.socket = io(baseUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.debug('[SocketService] connected', this.socket.id);
    });

    this.socket.on('connect_error', (error:any) => {
      console.error('[SocketService] connection error', error);
    });
  }

  on<T = any>(eventName: string): Observable<T> {
    return fromEvent<T>(this.socket, eventName);
  }

  onRefreshData<T = any>(): Observable<T> {
    return this.on<T>('refresh-data');
  }

  onDataUpdated<T = any>(): Observable<T> {
    return this.on<T>('data-updated');
  }

  onRefreshOrDataUpdated<T = any>(types: string[] = []): Observable<T> {
    const normalize = (value: string) => value.toString().trim().toLowerCase();
    const accepted = types.map(normalize);

    const shouldEmitUpdate = (payload: any): boolean => {
      if (accepted.length === 0) {
        return true;
      }

      if (payload === undefined || payload === null) {
        return true;
      }

      const type = typeof payload === 'string' ? normalize(payload) : payload?.type ? normalize(payload.type) : '';
      return !type || accepted.includes(type);
    };

    return merge(
      this.onRefreshData<T>(),
      this.onDataUpdated<T>().pipe(filter(shouldEmitUpdate))
    );
  }

  emit<T = any>(eventName: string, payload?: T): void {
    this.socket.emit(eventName, payload);
  }

  disconnect(): void {
    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
    }
  }
}
