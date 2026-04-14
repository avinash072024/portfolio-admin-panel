import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  colors: string[] = [
    'FF5733', '33FF57', '3357FF', 'FF33A8', 'A833FF',
    '33FFF6', 'FF8F33', '8FFF33', 'FF3333', '33FF8F',
    '338FFF', 'F6FF33', 'FF6F61', '6B5B95', '88B04B',
    'F7CAC9', '92A8D1', '955251', 'B565A7', '009B77'
  ];

  avatarColorMap: { [key: string]: string } = {};

  constructor(private http: HttpClient) { }

  getFeedbacks(): Observable<any> {
    return this.http.get(environment.apiUrl + '/feedback');
  }

  getAllFeedbacks(page: number = 1, limit: number = 5, search: string = ''): Observable<any> {
    let url = `${environment.apiUrl}/feedback?page=${page}&limit=${limit}`;
    if (search?.trim()) {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    return this.http.get(url);
  }

  updateFeedbackVerified(id: string, verified: boolean): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/feedback/${id}/verified`, { verified });
  }

  deleteFeedback(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/feedback/${id}`);
  }

  getRandomColor(): string {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }

  getTextColor(bgColor: string): string {
    const r = parseInt(bgColor.substring(0, 2), 16);
    const g = parseInt(bgColor.substring(2, 4), 16);
    const b = parseInt(bgColor.substring(4, 6), 16);

    // brightness formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 125 ? '000000' : 'ffffff';
  }

  getAvatar(name: string): string {
    const safeName = name || 'Anonymous';

    if (!this.avatarColorMap[safeName]) {
      this.avatarColorMap[safeName] = this.getRandomColor();
    }

    const bgColor = this.avatarColorMap[safeName];
    const textColor = this.getTextColor(bgColor);
    const formattedName = safeName.replace(/ /g, '+');

    // return `https://ui-avatars.com/api/?name=${formattedName}&background=${bgColor}&color=${textColor}&rounded=true&size=24`;
    return `https://ui-avatars.com/api/?name=${formattedName}&background=0D8ABC&color=fff&rounded=true&size=24`;
  }

  // getAvatar(name: string): string {
  //   const formattedName = (name || 'Anonymous').replace(/ /g, '+');
  //   return `https://ui-avatars.com/api/?name=${formattedName}&background=333&color=fff&rounded=true&size=24`;
  // }
}
