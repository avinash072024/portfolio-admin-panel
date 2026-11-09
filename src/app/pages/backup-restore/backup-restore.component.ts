import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { concatMap, from, Observable, tap, toArray } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { EducationService } from '../../services/education/education.service';
import { ExperienceService } from '../../services/experience/experience.service';
import { ProjectsService } from '../../services/projects/projects.service';
import { ServicesService } from '../../services/service/services.service';
import { SkillsService } from '../../services/skills/skills.service';

type BackupType = 'education' | 'experience' | 'services' | 'projects' | 'skills';
type BackupRecord = Record<string, unknown>;

@Component({
  selector: 'app-backup-restore',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './backup-restore.component.html',
  styleUrl: './backup-restore.component.scss'
})
export class BackupRestoreComponent {
  readonly backupTypes: { value: BackupType; label: string }[] = [
    { value: 'education', label: 'Education' },
    { value: 'experience', label: 'Experience' },
    { value: 'services', label: 'Services' },
    { value: 'projects', label: 'Projects' },
    { value: 'skills', label: 'Skills' }
  ];

  selectedBackup: BackupType | '' = '';
  selectedFile: File | null = null;
  isImporting = false;
  importedCount = 0;

  private educationService = inject(EducationService);
  private experienceService = inject(ExperienceService);
  private servicesService = inject(ServicesService);
  private projectsService = inject(ProjectsService);
  private skillsService = inject(SkillsService);
  private spinner = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);

  onBackupTypeChange(event: Event): void {
    this.selectedBackup = (event.target as HTMLSelectElement).value as BackupType | '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (file && !file.name.toLowerCase().endsWith('.json')) {
      this.toastr.error('Please select a JSON backup file.');
      input.value = '';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
  }

  async importBackup(): Promise<void> {
    if (!this.selectedBackup) {
      this.toastr.warning('Select which backup you are uploading.');
      return;
    }
    if (!this.selectedFile) {
      this.toastr.warning('Select a JSON backup file to upload.');
      return;
    }
    if (this.isImporting) return;

    this.isImporting = true;
    let json: string;
    try {
      json = await this.selectedFile.text();
    } catch {
      this.isImporting = false;
      this.toastr.error('Unable to read the selected backup file.');
      return;
    }

    let records: unknown;
    try {
      records = JSON.parse(json);
    } catch {
      this.isImporting = false;
      this.toastr.error('The selected file is not valid JSON.');
      return;
    }

    if (!Array.isArray(records) || records.length === 0) {
      this.isImporting = false;
      this.toastr.error('The backup must contain a non-empty JSON array of records.');
      return;
    }
    if (records.some(record => !this.isBackupRecord(record))) {
      this.isImporting = false;
      this.toastr.error('Every item in the backup must be a JSON object.');
      return;
    }

    this.importedCount = 0;
    this.spinner.show();
    from(records as BackupRecord[]).pipe(
      concatMap(record => this.createRecord(this.prepareRecord(record)).pipe(
        tap(response => {
          if (this.isFailedResponse(response)) {
            throw new Error(response['message'] as string || 'The server rejected a backup record.');
          }
          this.importedCount += 1;
        })
      )),
      toArray()
    ).subscribe({
      next: () => {
        this.spinner.hide();
        this.isImporting = false;
        this.toastr.success(`${this.importedCount} ${this.selectedBackup} ${this.importedCount > 1 ? 'records': 'record'} restored successfully.`);
      },
      error: (error: unknown) => {
        this.spinner.hide();
        this.isImporting = false;
        const message = this.getErrorMessage(error);
        const progress = this.importedCount > 0
          ? `${this.importedCount} ${this.importedCount > 1 ? 'records': 'record'} were added before the import failed. `
          : '';
        this.toastr.error(`${progress}${message}`);
      }
    });
  }

  private createRecord(record: BackupRecord): Observable<unknown> {
    switch (this.selectedBackup) {
      case 'education':
        return this.educationService.addEducation(record);
      case 'experience':
        return this.experienceService.addExperience(record);
      case 'services':
        return this.servicesService.addService(record);
      case 'projects':
        return this.projectsService.addProject(record);
      case 'skills':
        return this.skillsService.addSkill(record);
      default:
        throw new Error('Select a supported backup type.');
    }
  }

  private prepareRecord(record: BackupRecord): BackupRecord {
    const payload = { ...record };
    // delete payload['_id'];
    // delete payload['id'];
    // delete payload['__v'];

    if (this.selectedBackup === 'projects' || this.selectedBackup === 'skills') {
      const category = payload['category'];
      if (typeof category === 'object' && category !== null && '_id' in category) {
        const categoryId = (category as BackupRecord)['_id'];
        if (typeof categoryId === 'string') payload['category'] = categoryId;
      }
    }

    return payload;
  }

  private isBackupRecord(value: unknown): value is BackupRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private isFailedResponse(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object'
      && value !== null
      && 'success' in value
      && (value as Record<string, unknown>)['success'] === false;
  }

  private getErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const response = (error as { error?: { message?: unknown } }).error;
      if (typeof response?.message === 'string') return response.message;
    }
    if (error instanceof Error) return error.message;
    return 'Unable to restore the backup. Please try again.';
  }
}
