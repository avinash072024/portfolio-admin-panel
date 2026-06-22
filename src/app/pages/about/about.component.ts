import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EducationService } from '../../services/education/education.service';
import { ExperienceService } from '../../services/experience/experience.service';
import { ThemeService } from '../../services/theme/theme.service';
import { ResumesService } from '../../services/resume/resumes.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';
import { ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-about',
  imports: [CommonModule, ReactiveFormsModule, ConfirmModalComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent  implements OnInit {
  private educationService = inject(EducationService);
  private experienceService = inject(ExperienceService);
  private resumesService = inject(ResumesService);
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
  editResumeId: string | null = null;
  showHideResetButtonInResumeForm = false;

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
      title: ['', Validators.required],
      file: [null, Validators.required]
    });

    this.loadAllData();
  }

  loadAllData(): void {
    this.spinner.show();
    forkJoin({
      educations: this.educationService.getEducation(),
      experiences: this.experienceService.getExperience(),
      resumes: this.resumesService.getResumes(),
    }).subscribe({
      next: (res: any) => {
        // ✅ Education
        this.spinner.hide();
        if (res.educations) {
          this.educations = res.educations?.educations || res.educations || [];
        } else {
          this.educations = [];
          this.toastr.warning('No education data found');
        }

        // ✅ Experience
        if (res.experiences) {
          this.experiences = res.experiences?.experiences || res.experiences || [];
        } else {
          this.experiences = [];
          this.toastr.warning('No experience data found');
        }

        // resumes
        if (res.resumes.success) {
          this.resumes = res.resumes?.resumes || res.resumes || [];
        } else {
          this.resumes = [];
          this.toastr.warning('No resume data found');
        }
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err?.error?.message || 'Failed to load data');
      }
    });
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
          this.showHideResetButtonInEducationForm = false;
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
    this.experienceService.getExperience().subscribe({
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
      this.experienceService.updateExperience(this.editExperienceId, payload).subscribe({
        next: (res: any) => {
          this.resetExperienceForm();
          this.loadExperiences();
          this.showHideResetButtonInExperienceForm = false;
          this.spinner.hide();
          this.toastr.success(res?.message || 'Experience updated');
        },
        error: (err) => {
          this.spinner.hide();
          this.toastr.error(err?.error?.message || 'Update failed');
        }
      });
    } else {
      this.experienceService.addExperience(payload).subscribe({
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
      const confirmed = await this.confirmModal.open('Confirm Deletion', `Are you sure you want to delete experience ${itemName}? This action cannot be undone.`, itemName, 'experience');
      if (!confirmed) return;
      this.experienceService.deleteExperience(id).subscribe({
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

  onResumeFileSelected(ev: any): void {
    const f: File | null = ev?.target?.files?.[0] || null;
    this.selectedResumeFile = f;

    if (this.resumeForm) {
      const fileControl = this.resumeForm.get('file');

      if (f) {
        // Check if the file type is application/pdf
        if (f.type === 'application/pdf') {
          fileControl?.setValue(f);
          fileControl?.setErrors(null); // Clear any previous file type errors
        } else {
          // Reset the control value and throw an error
          fileControl?.setValue(null);
          this.selectedResumeFile = null; // Clear the local property too

          // Set a custom error on the form control
          fileControl?.setErrors({ invalidFileType: true });
        }
      } else {
        fileControl?.setValue(null);
      }

      fileControl?.markAsDirty();
      fileControl?.markAsTouched();
    }
  }

  loadResumes(): void {
    this.resumesService.getResumes().subscribe({
      next: (res: any) => {
        // this.resumes = res?.resumes || res || [];
        this.resumes = res.resumes?.resumes || res.resumes || [];
      },
      error: (err) => this.toastr.error(err?.error?.message || 'Failed to load resumes')
    });
  }

  saveResume(): void {
    if (!this.resumeForm) return;

    if (!this.editResumeId && !this.selectedResumeFile) {
      this.resumeForm.get('file')?.setValidators(Validators.required);
      this.resumeForm.get('file')?.updateValueAndValidity();
      this.resumeForm.markAllAsTouched();
      return;
    }

    if (this.editResumeId) {
      this.resumeForm.get('file')?.clearValidators();
      this.resumeForm.get('file')?.updateValueAndValidity();
    }

    if (this.resumeForm.invalid) {
      this.resumeForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const title = this.resumeForm.get('title')?.value?.trim();
    if (title) {
      formData.append('title', title);
    }
    if (this.selectedResumeFile) {
      formData.append('resume', this.selectedResumeFile);
    }

    this.spinner.show();
    const request$ = this.editResumeId
      ? this.resumesService.updateResume(this.editResumeId, formData)
      : this.resumesService.uploadResume(formData);

    request$.subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.resetResumeForm();
        this.loadResumes();
        this.toastr.success(res?.message || 'Resume saved successfully');
      },
      error: (err) => {
        this.spinner.hide();
        this.toastr.error(err?.error?.message || 'Resume save failed');
      }
    });
  }

  editResume(resume: any): void {
    this.editResumeId = resume?._id || resume?.id || null;
    this.showHideResetButtonInResumeForm = true;
    this.selectedResumeFile = null;
    this.resumeForm.get('file')?.clearValidators();
    this.resumeForm.patchValue({
      title: resume?.title || '',
      file: null
    });
  }

  deleteResume(id: string, itemName: string): void {
    (async () => {
      const confirmed = await this.confirmModal.open('Confirm Deletion', `Are you sure you want to delete resume ${itemName}? This action cannot be undone.`, itemName, 'resume');
      if (!confirmed) return;
      this.resumesService.deleteResume(id).subscribe({
        next: (res: any) => {
          this.toastr.success(res?.message || 'Resume deleted');
          this.loadResumes();
        },
        error: (err) => this.toastr.error(err?.error?.message || 'Delete failed')
      });
    })();
  }

  viewResume(resume: any): void {
    const id = resume?._id || resume?.id;
    if (!id) return;

    this.resumesService.getResumeById(id).subscribe({
      next: (res: any) => {
        const resumeData = res?.resume || res;
        this.openResumePdf(resumeData);
      },
      error: (err) => this.toastr.error(err?.error?.message || 'Failed to open resume')
    });
  }

  resetResumeForm(): void {
    this.editResumeId = null;
    this.selectedResumeFile = null;
    this.showHideResetButtonInResumeForm = false;
    this.resumeForm.reset();
    this.resumeForm.get('file')?.setValidators(Validators.required);
    this.resumeForm.get('file')?.updateValueAndValidity();
  }

  private openResumePdf(resume: any): void {
    if (!resume?.pdfData) {
      this.toastr.error('Resume PDF data not found');
      return;
    }

    const contentType = resume.contentType || 'application/pdf';
    const byteCharacters = atob(resume.pdfData);
    const byteNumbers = Array.from(byteCharacters, char => char.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}
