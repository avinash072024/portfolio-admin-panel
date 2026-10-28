import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  /**
   * Downloads data as a formatted JSON file.
   * @param data The data object or array to export.
   * @param fileNamePrefix Prefix for the downloaded file (e.g. 'projects').
   */
  downloadJson(data: any, fileNamePrefix: string): void {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `${fileNamePrefix}-backup-${dateStr}.json`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
  }
}

