import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EducationService } from '../../services/education/education.service';
import { ExperienceService } from '../../services/experience/experience.service';
import { ResumeService } from '../../services/resume/resume.service';
import { ThemeService } from '../../services/theme/theme.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  private educationService = inject(EducationService);
  private experienceService = inject(ExperienceService);
  private resumeService = inject(ResumeService);
  themeService = inject(ThemeService);
  private toastr = inject(ToastrService);

  educations: any[] = [];
  experiences: any[] = [];
  resumes: any[] = [];

  // simple forms
  newEducation: any = { title: '', institution: '', duration: '', description: '' };
  editEducationId: string | null = null;

  newExperience: any = { title: '', company: '', duration: '', description: '' };
  editExperienceId: string | null = null;

  // resume upload
  selectedResumeFile: File | null = null;

  ngOnInit(): void {
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
    if (this.editEducationId) {
      this.educationService.updateEducation(this.editEducationId, this.newEducation).subscribe({
        next: (res: any) => {
          this.toastr.success(res?.message || 'Education updated');
          this.resetEducationForm();
          this.loadEducations();
        },
        error: (err) => this.toastr.error(err?.error?.message || 'Update failed')
      });
    } else {
      this.educationService.addEducation(this.newEducation).subscribe({
        next: (res: any) => {
          this.toastr.success(res?.message || 'Education added');
          this.resetEducationForm();
          this.loadEducations();
        },
        error: (err) => this.toastr.error(err?.error?.message || 'Create failed')
      });
    }
  }

  editEducation(e: any): void {
    this.editEducationId = e._id || e.id || null;
    this.newEducation = { title: e.title, institution: e.institution, duration: e.duration, description: e.description };
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
    this.newEducation = { title: '', institution: '', duration: '', description: '' };
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
    if (this.editExperienceId) {
      this.experienceService.updateProject(this.editExperienceId, this.newExperience).subscribe({
        next: (res: any) => {
          this.toastr.success(res?.message || 'Experience updated');
          this.resetExperienceForm();
          this.loadExperiences();
        },
        error: (err) => this.toastr.error(err?.error?.message || 'Update failed')
      });
    } else {
      this.experienceService.addProject(this.newExperience).subscribe({
        next: (res: any) => {
          this.toastr.success(res?.message || 'Experience added');
          this.resetExperienceForm();
          this.loadExperiences();
        },
        error: (err) => this.toastr.error(err?.error?.message || 'Create failed')
      });
    }
  }

  editExperience(e: any): void {
    this.editExperienceId = e._id || e.id || null;
    this.newExperience = { title: e.title, company: e.company, duration: e.duration, description: e.description };
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
    this.newExperience = { title: '', company: '', duration: '', description: '' };
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
