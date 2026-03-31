import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EducationService } from '../../services/education/education.service';
import { ExperienceService } from '../../services/experience/experience.service';
import { ResumeService } from '../../services/resume/resume.service';
import { ThemeService } from '../../services/theme/theme.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, ReactiveFormsModule],
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

  educations: any[] = [];
  experiences: any[] = [];
  resumes: any[] = [];

  // reactive forms
  educationForm!: FormGroup;
  editEducationId: string | null = null;

  experienceForm!: FormGroup;
  editExperienceId: string | null = null;

  // resume upload
  selectedResumeFile: File | null = null;

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
      this.educationForm.patchValue({
        title: e.title || '',
        institution: e.institution || '',
        duration: e.duration || '',
        description: e.description || ''
      });
    }
  }

  deleteEducation(id: string): void {
    if (!confirm('Delete this education?')) return;
    this.educationService.deleteEducation(id).subscribe({
      next: (res: any) => {
        this.toastr.success(res?.message || 'Deleted');
        this.loadEducations();
      },
      error: (err) => this.toastr.error(err?.error?.message || 'Delete failed')
    });
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
      this.experienceForm.patchValue({
        title: e.title || '',
        company: e.company || '',
        duration: e.duration || '',
        description: e.description || ''
      });
    }
  }

  deleteExperience(id: string): void {
    if (!confirm('Delete this experience?')) return;
    this.experienceService.deleteProject(id).subscribe({
      next: (res: any) => {
        this.toastr.success(res?.message || 'Deleted');
        this.loadExperiences();
      },
      error: (err) => this.toastr.error(err?.error?.message || 'Delete failed')
    });
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
  }

  uploadResume(): void {
    if (!this.selectedResumeFile) { this.toastr.error('Select file first'); return; }
    const fd = new FormData();
    fd.append('file', this.selectedResumeFile);
    this.resumeService.addResume(fd).subscribe({
      next: (res: any) => {
        this.toastr.success('Resume uploaded');
        this.selectedResumeFile = null;
        this.loadResumes();
      },
      error: (err) => this.toastr.error(err?.error?.message || 'Upload failed')
    });
  }

  deleteResume(id: string): void {
    if (!confirm('Delete this resume?')) return;
    this.resumeService.deleteResume(id).subscribe({
      next: (res: any) => {
        this.toastr.success(res?.message || 'Deleted');
        this.loadResumes();
      },
      error: (err) => this.toastr.error(err?.error?.message || 'Delete failed')
    });
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
