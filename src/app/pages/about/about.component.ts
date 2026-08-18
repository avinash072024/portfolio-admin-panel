import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EducationService } from '../../services/education/education.service';
import { ExperienceService } from '../../services/experience/experience.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';
import { ViewChild } from '@angular/core';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { SocketService } from '../../services/socket/socket.service';
import { CapitalizeDirective } from '../../directives/capitalize.directive';

@Component({
  selector: 'app-about',
  imports: [CommonModule, ReactiveFormsModule, ConfirmModalComponent, CapitalizeDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit, OnDestroy {
  private educationService = inject(EducationService);
  private experienceService = inject(ExperienceService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private fb = inject(FormBuilder);
  private socketService = inject(SocketService);
  private destroy$ = new Subject<void>();
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

    this.subscribeToSocketUpdates();
    this.loadAllData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToSocketUpdates(): void {
    this.socketService
      .onRefreshOrDataUpdated(['educations', 'education', 'experiences', 'experience', 'resumes', 'resume'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAllData();
      });
  }

  loadAllData(): void {
    this.spinner.show();
    forkJoin({
      educations: this.educationService.getEducation(),
      experiences: this.experienceService.getExperience(),
      // resumes: this.resumesService.getResumes(),
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
}
