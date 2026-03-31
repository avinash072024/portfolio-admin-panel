import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EducationService } from '../../services/education/education.service';
import { ExperienceService } from '../../services/experience/experience.service';
import { ResumeService } from '../../services/resume/resume.service';
import { ThemeService } from '../../services/theme/theme.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, ReactiveFormsModule, ConfirmModalComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  private educationService = inject(EducationService);
  private experienceService = inject(ExperienceService);
  private resumeService = inject(ResumeService);
  themeService = inject(ThemeService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private fb = inject(FormBuilder);
  @ViewChild(ConfirmModalComponent) confirmModal!: ConfirmModalComponent;

  educations: any[] = [];
  experiences: any[] = [];
  resumes: any[] = [];

  showHideResetButtonInExperienceForm = false;
  showHideResetButtonInEducationForm = false;

  // reactive forms
  educationForm!: FormGroup;
  editEducationId: string | null = null;

  experienceForm!: FormGroup;
  editExperienceId: string | null = null;

  // resume upload
  selectedResumeFile: File | null = null;
  resumeForm!: FormGroup;

  ngOnInit(): void {
    this.educationForm = this.fb.group({
      title: ['', Validators.required],
      institution: ['', Validators.required],
      duration: ['', Validators.required],
      description: ['']
    });

    this.experienceForm = this.fb.group({
      title: ['', Validators.required],
      company: ['', Validators.required],
      duration: ['', Validators.required],
      description: ['']
    });

    this.resumeForm = this.fb.group({
      file: [null, Validators.required]
    });

    this.loadEducations();
    this.loadExperiences();
    this.loadResumes();
  }

  // Education
  loadEducations(): void {
    this.educationService.getEducation().subscribe({
      next: (res: any) => {
        this.educations = res?.educations || res || [];
      },
      error: (err) => this.toastr.error(err?.error?.message || 'Failed to load educations')
    });
  }

  saveEducation(): void {
    if (!this.educationForm) return;
    if (this.educationForm.invalid) {
      this.educationForm.markAllAsTouched();
      return;
    }

    this.spinner.show();
    const payload = this.educationForm.value;
    if (this.editEducationId) {
      this.educationService.updateEducation(this.editEducationId, payload).subscribe({
        next: (res: any) => {
          this.resetEducationForm();
          this.loadEducations();
          this.spinner.hide();
          this.toastr.success(res?.message || 'Education updated');
        },
        error: (err) => {
          this.spinner.hide();
          this.toastr.error(err?.error?.message || 'Update failed');
        }
      });
    } else {
      this.educationService.addEducation(payload).subscribe({
        next: (res: any) => {
          this.resetEducationForm();
          this.loadEducations();
          this.spinner.hide();
          this.toastr.success(res?.message || 'Education added');
        },
        error: (err) => {
          this.spinner.hide();
          this.toastr.error(err?.error?.message || 'Create failed');
        }
      });
    }
  }

  editEducation(e: any): void {
    this.editEducationId = e._id || e.id || null;
    if (this.educationForm) {
      this.showHideResetButtonInEducationForm = true;
      this.educationForm.patchValue({
        title: e.title || '',
        institution: e.institution || '',
        duration: e.duration || '',
        description: e.description || ''
      });
    }
  }

  deleteEducation(id: string, itemName: string): void {
    (async () => {
      const confirmed = await this.confirmModal.open('Confirm Deletion', `Are you sure you want to delete education ${itemName}? This action cannot be undone.`, itemName, 'education');
      if (!confirmed) return;
      this.educationService.deleteEducation(id).subscribe({
        next: (res: any) => {
          this.toastr.success(res?.message || 'Deleted');
          this.loadEducations();
        },
        error: (err) => this.toastr.error(err?.error?.message || 'Delete failed')
      });
    })();
  }

  resetEducationForm(): void {
    this.editEducationId = null;
    if (this.educationForm) this.educationForm.reset();
  }

  // Experience
  loadExperiences(): void {
    this.experienceService.getProject().subscribe({
      next: (res: any) => {
        this.experiences = res?.experiences || res || [];
      },
      error: (err) => this.toastr.error(err?.error?.message || 'Failed to load experiences')
    });
  }

  saveExperience(): void {
    if (!this.experienceForm) return;
    if (this.experienceForm.invalid) {
      this.experienceForm.markAllAsTouched();
      return;
    }

    this.spinner.show();
    const payload = this.experienceForm.value;
    if (this.editExperienceId) {
      this.experienceService.updateProject(this.editExperienceId, payload).subscribe({
        next: (res: any) => {
          this.resetExperienceForm();
          this.loadExperiences();
          this.spinner.hide();
          this.toastr.success(res?.message || 'Experience updated');
        },
        error: (err) => {
          this.spinner.hide();
          this.toastr.error(err?.error?.message || 'Update failed');
        }
      });
    } else {
      this.experienceService.addProject(payload).subscribe({
        next: (res: any) => {
          this.resetExperienceForm();
          this.loadExperiences();
          this.spinner.hide();
          this.toastr.success(res?.message || 'Experience added');
        },
        error: (err) => {
          this.spinner.hide();
          this.toastr.error(err?.error?.message || 'Create failed');
        }
      });
    }
  }

  editExperience(e: any): void {
    this.editExperienceId = e._id || e.id || null;
    if (this.experienceForm) {
      this.showHideResetButtonInExperienceForm = true;
      this.experienceForm.patchValue({
        title: e.title || '',
        company: e.company || '',
        duration: e.duration || '',
        description: e.description || ''
      });
    }
  }

  deleteExperience(id: string, itemName: string): void {
    (async () => {
      debugger;
      const confirmed = await this.confirmModal.open('Confirm Deletion', `Are you sure you want to delete experience ${itemName}? This action cannot be undone.`, itemName, 'experience');
      if (!confirmed) return;
      this.experienceService.deleteProject(id).subscribe({
        next: (res: any) => {
          this.toastr.success(res?.message || 'Deleted');
          this.loadExperiences();
        },
        error: (err) => this.toastr.error(err?.error?.message || 'Delete failed')
      });
    })();
  }

  resetExperienceForm(): void {
    this.editExperienceId = null;
    if (this.experienceForm) this.experienceForm.reset();
  }

  // Resumes
  loadResumes(): void {
    this.resumeService.getResumes().subscribe({
      next: (res: any) => {
        this.resumes = res || [];
      },
      error: (err) => this.toastr.error(err?.error?.message || 'Failed to load resumes')
    });
  }

  onResumeFileSelected(ev: any): void {
    const f = ev?.target?.files?.[0] || null;
    this.selectedResumeFile = f;
    if (this.resumeForm) {
      this.resumeForm.get('file')?.setValue(f);
      this.resumeForm.get('file')?.markAsDirty();
      this.resumeForm.get('file')?.markAsTouched();
    }
  }

  uploadResume(): void {
    if (!this.resumeForm) return;
    if (this.resumeForm.invalid) {
      this.resumeForm.markAllAsTouched();
      // this.toastr.error('Select file first');
      return;
    }

    const fileControl = this.resumeForm.get('file');
    const file = fileControl?.value || this.selectedResumeFile;
    if (!file) { this.toastr.error('Select file first'); return; }

    const fd = new FormData();
    fd.append('file', file);
    this.spinner.show();
    this.resumeService.addResume(fd).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.toastr.success('Resume uploaded');
        this.selectedResumeFile = null;
        if (this.resumeForm) this.resumeForm.reset();
        this.resumeForm.get('file')?.setValue(null);
        this.loadResumes();
      },
      error: (err) => {
        this.spinner.hide();
        this.toastr.error(err?.error?.message || 'Upload failed');
      }
    });
  }

  deleteResume(id: string, itemName: string): void {
    (async () => {
      const confirmed = await this.confirmModal.open('Confirm Deletion', `Are you sure you want to delete resume ${itemName}? This action cannot be undone.`, itemName, 'resume');
      if (!confirmed) return;
      this.resumeService.deleteResume(id).subscribe({
        next: (res: any) => {
          this.toastr.success(res?.message || 'Deleted');
          this.loadResumes();
        },
        error: (err) => this.toastr.error(err?.error?.message || 'Delete failed')
      });
    })();
  }

  // Theme / Skin
  toggleTheme(theme: string): void {
    this.themeService.toggleTheme(theme);
    this.toastr.success('Theme updated');
  }

  setSkin(s: string): void {
    this.themeService.setSkin(s);
    this.toastr.success('Skin updated');
  }
}
