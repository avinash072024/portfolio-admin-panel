import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CapitalizeDirective } from '../../directives/capitalize.directive';
import { EducationService } from '../../services/education/education.service';
import { ExperienceService } from '../../services/experience/experience.service';

type AboutRecordType = 'education' | 'experience';

@Component({
  selector: 'app-add-edit-about',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CapitalizeDirective],
  templateUrl: './add-edit-about.component.html',
  styleUrl: './add-edit-about.component.scss'
})
export class AddEditAboutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private educationService = inject(EducationService);
  private experienceService = inject(ExperienceService);
  private spinner = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  type: AboutRecordType = 'education';
  recordId: string | null = null;

  get isEdit(): boolean {
    return this.recordId !== null;
  }

  get heading(): string {
    return `${this.isEdit ? 'Edit' : 'Add'} ${this.type === 'education' ? 'Education' : 'Experience'}`;
  }

  ngOnInit(): void {
    const type = this.route.snapshot.paramMap.get('type');
    if (type !== 'education' && type !== 'experience') {
      this.router.navigate(['/about']);
      return;
    }
    this.type = type;
    this.recordId = this.route.snapshot.paramMap.get('id');
    this.form = this.fb.group({
      title: ['', Validators.required],
      [this.type === 'education' ? 'institution' : 'company']: ['', Validators.required],
      duration: ['', Validators.required],
      description: [''],
      isActive: [true]
    });
    if (this.recordId) this.loadRecord(this.recordId);
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.spinner.show();
    const payload = this.form.getRawValue();
    const request = this.type === 'education'
      ? this.recordId ? this.educationService.updateEducation(this.recordId, payload) : this.educationService.addEducation(payload)
      : this.recordId ? this.experienceService.updateExperience(this.recordId, payload) : this.experienceService.addExperience(payload);
    request.subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res?.success === false) {
          this.toastr.error(res?.message || 'Unable to save entry');
          return;
        }
        this.toastr.success(res?.message || `${this.type === 'education' ? 'Education' : 'Experience'} ${this.isEdit ? 'updated' : 'added'}`);
        this.router.navigate(['/about']);
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err?.error?.message || err?.message || 'Unable to save entry');
      }
    });
  }

  private loadRecord(id: string): void {
    this.spinner.show();
    const request = this.type === 'education'
      ? this.educationService.getEducationById(id)
      : this.experienceService.getExperienceById(id);
    request.subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res?.success === false) {
          this.toastr.error(res?.message || 'Failed to load entry');
          this.router.navigate(['/about']);
          return;
        }
        const record = res?.education || res?.experience || res?.data || res;
        const field = this.type === 'education' ? 'institution' : 'company';
        this.form.patchValue({
          title: record.title || '',
          [field]: record[field] || '',
          duration: record.duration || '',
          description: record.description || '',
          isActive: record.isActive !== undefined ? record.isActive : true 
        });
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err?.error?.message || err?.message || 'Failed to load entry');
        this.router.navigate(['/about']);
      }
    });
  }
}