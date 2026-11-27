import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
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
  imports: [CommonModule, ReactiveFormsModule],
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

  readonly backupForm = new FormGroup({
    backupType: new FormControl<BackupType | ''>('', { nonNullable: true, validators: Validators.required }),
    backupFile: new FormControl<File | null>(null, [Validators.required, this.validateJsonFile])
  });
  submitted = false;
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

  get selectedBackup(): BackupType | '' {
    return this.backupForm.controls.backupType.value;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.backupForm.controls.backupFile.setValue(input.files?.[0] ?? null);
  }

  get showBackupTypeError(): boolean {
    const control = this.backupForm.controls.backupType;
    return control.invalid && (control.touched || this.submitted);
  }

  get showBackupFileError(): boolean {
    const control = this.backupForm.controls.backupFile;
    return control.invalid && (control.touched || this.submitted);
  }

  async importBackup(): Promise<void> {
    if (this.isImporting) return;
    if (this.backupForm.invalid) {
      this.submitted = true;
      this.backupForm.markAllAsTouched();
      return;
    }

    const selectedFile = this.backupForm.controls.backupFile.value;
    if (!selectedFile || !this.selectedBackup) {
      return;
    }

    this.isImporting = true;
    this.backupForm.disable();
    let spinnerVisible = false;

    try {
      let json: string;
      try {
        json = await selectedFile.text();
      } catch {
        this.toastr.error('Unable to read the selected backup file.');
        return;
      }

      let records: unknown;
      try {
        records = JSON.parse(json);
      } catch {
        this.toastr.error('The selected file is not valid JSON.');
        return;
      }

      if (!Array.isArray(records) || records.length === 0) {
        this.toastr.error('The backup must contain a non-empty JSON array of records.');
        return;
      }
      if (records.some(record => !this.isBackupRecord(record))) {
        this.toastr.error('Every item in the backup must be a JSON object.');
        return;
      }

      this.importedCount = 0;
      this.spinner.show();
      spinnerVisible = true;
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
      }
    } finally {
      try {
        if (spinnerVisible) this.spinner.hide();
      } finally {
        this.backupForm.enable();
        this.isImporting = false;
      }
    }
  }

  private validateJsonFile(control: AbstractControl): ValidationErrors | null {
    const file = control.value as File | null;
    return file && !file.name.toLowerCase().endsWith('.json') ? { invalidFileType: true } : null;
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
