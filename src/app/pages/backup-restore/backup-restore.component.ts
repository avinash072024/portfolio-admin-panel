import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { EducationService } from '../../services/education/education.service';
import { ExperienceService } from '../../services/experience/experience.service';
import { FeedbackService } from '../../services/feedback/feedback.service';
import { ProjectsService } from '../../services/projects/projects.service';
import { ServicesService } from '../../services/service/services.service';
import { SkillsService } from '../../services/skills/skills.service';
import { VisitorService } from '../../services/visitor/visitor.service';

type BackupType = 'education' | 'experience' | 'services' | 'projects' | 'skills' | 'visitors' | 'feedback';
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
    { value: 'education', label: 'Educations' },
    { value: 'experience', label: 'Experiences' },
    { value: 'services', label: 'Services' },
    { value: 'projects', label: 'Projects' },
    { value: 'skills', label: 'Skills' },
    { value: 'visitors', label: 'Website Visitors' },
    { value: 'feedback', label: 'Feedbacks' }
  ];

  selectedBackup: BackupType | '' = '';
  selectedFile: File | null = null;
  isImporting = false;
  importedCount = 0;

  private educationService = inject(EducationService);
  private experienceService = inject(ExperienceService);
  private feedbackService = inject(FeedbackService);
  private servicesService = inject(ServicesService);
  private projectsService = inject(ProjectsService);
  private skillsService = inject(SkillsService);
  private visitorService = inject(VisitorService);
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
    try {
      const preparedRecords = (records as BackupRecord[]).map(record => this.prepareRecord(record));
      const response = await firstValueFrom(this.createRecords(preparedRecords));
      if (this.isFailedResponse(response)) {
        throw new Error(response['message'] as string || 'The server rejected the backup records.');
      }

      this.importedCount = preparedRecords.length;
      this.toastr.success(`${this.importedCount} ${this.selectedBackup} ${this.importedCount > 1 ? 'records': 'record'} restored successfully.`);
    } catch (error: unknown) {
      this.toastr.error(this.getErrorMessage(error));
    } finally {
      this.spinner.hide();
      this.isImporting = false;
    }
  }

  private createRecords(records: BackupRecord[]): Observable<unknown> {
    switch (this.selectedBackup) {
      case 'education':
        return this.educationService.addMultipleEducation(records);
      case 'experience':
        return this.experienceService.addMultipleExperience(records);
      case 'services':
        return this.servicesService.addMultipleServices(records);
      case 'projects':
        return this.projectsService.addMultipleProjects(records);
      case 'skills':
        return this.skillsService.addMultipleSkills(records);
      case 'visitors':
        return this.visitorService.addMultipleVisitors(records);
      case 'feedback':
        return this.feedbackService.addMultipleFeedbacks(records);
      default:
        throw new Error('Select a supported backup type.');
    }
  }

  private prepareRecord(record: BackupRecord): BackupRecord {
    const payload = { ...record };
    delete payload['_id'];
    delete payload['id'];
    delete payload['__v'];

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
