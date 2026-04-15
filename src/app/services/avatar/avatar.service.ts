import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {
  // 20 unique, visually distinct background colors
  colors: string[] = [
    'E63946', // Red
    '2A9D8F', // Teal
    '264653', // Dark Blue
    'E9C46A', // Gold
    'F4A261', // Sandy Orange
    '6A0572', // Purple
    '1D3557', // Navy
    '457B9D', // Steel Blue
    'F72585', // Hot Pink
    '7209B7', // Violet
    '3A0CA3', // Indigo
    '4361EE', // Royal Blue
    '4CC9F0', // Sky Blue
    '06D6A0', // Mint Green
    'FFB703', // Amber
    'FB8500', // Tangerine
    '8338EC', // Electric Purple
    '3F8F29', // Forest Green
    'D62828', // Crimson
    '023E8A'  // Deep Ocean
  ];

  private colorIndex: number = 0;
  avatarColorMap: { [key: string]: string } = {};

  constructor() { }

  getNextColor(): string {
    const color = this.colors[this.colorIndex % this.colors.length];
    this.colorIndex++;
    return color;
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
      this.avatarColorMap[safeName] = this.getNextColor();
    }

    const bgColor = this.avatarColorMap[safeName];
    const textColor = this.getTextColor(bgColor);
    const formattedName = safeName.replace(/ /g, '+');

    return `https://ui-avatars.com/api/?name=${formattedName}&background=${bgColor}&color=${textColor}&rounded=true&size=35`;
  }
}
