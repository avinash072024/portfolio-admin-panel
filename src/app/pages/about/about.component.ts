import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { EducationService } from '../../services/education/education.service';
import { ExperienceService } from '../../services/experience/experience.service';
import { SocketService } from '../../services/socket/socket.service';

type AboutRecordType = 'education' | 'experience';

@Component({
  selector: 'app-about',
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit, OnDestroy {
  private educationService = inject(EducationService);
  private experienceService = inject(ExperienceService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private socketService = inject(SocketService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  educations: any[] = [];
  experiences: any[] = [];
  selectedEducationIds = new Set<string>();
  selectedExperienceIds = new Set<string>();
  showDeleteModal = false;
  showBulkDeleteModal = false;
  pendingType: AboutRecordType = 'education';
  private pendingId = '';
  pendingTitle = '';

  ngOnInit(): void {
    this.loadAllData();
    this.socketService
      .onRefreshOrDataUpdated(['educations', 'education', 'experiences', 'experience'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadAllData());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.body.style.overflow = '';
  }

  loadAllData(): void {
    this.spinner.show();
    forkJoin({
      educations: this.educationService.getEducation(),
      experiences: this.experienceService.getExperience()
    }).subscribe({
      next: (res: any) => {
        this.educations = res.educations?.educations || res.educations || [];
        this.experiences = res.experiences?.experiences || res.experiences || [];
        this.spinner.hide();
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err?.error?.message || 'Failed to load About entries');
      }
    });
  }

  getRecordId(record: any): string {
    return record?._id || record?.id || '';
  }

  get allEducationSelected(): boolean {
    return this.educations.length > 0 && this.educations.every(record => this.selectedEducationIds.has(this.getRecordId(record)));
  }

  get allExperienceSelected(): boolean {
    return this.experiences.length > 0 && this.experiences.every(record => this.selectedExperienceIds.has(this.getRecordId(record)));
  }

  toggleAll(type: AboutRecordType): void {
    const records = type === 'education' ? this.educations : this.experiences;
    const selected = type === 'education' ? this.selectedEducationIds : this.selectedExperienceIds;
    const allSelected = type === 'education' ? this.allEducationSelected : this.allExperienceSelected;
    records.forEach(record => {
      const id = this.getRecordId(record);
      if (!id) return;
      allSelected ? selected.delete(id) : selected.add(id);
    });
  }

  toggleRecord(type: AboutRecordType, id: string): void {
    if (!id) return;
    const selected = type === 'education' ? this.selectedEducationIds : this.selectedExperienceIds;
    selected.has(id) ? selected.delete(id) : selected.add(id);
  }

  openDeleteModal(type: AboutRecordType, record: any): void {
    this.pendingType = type;
    this.pendingId = this.getRecordId(record);
    this.pendingTitle = record.title || 'this entry';
    this.showDeleteModal = true;
    document.body.style.overflow = 'hidden';
  }

  openBulkDeleteModal(type: AboutRecordType): void {
    const selected = type === 'education' ? this.selectedEducationIds : this.selectedExperienceIds;
    if (!selected.size) return;
    this.pendingType = type;
    this.showBulkDeleteModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.restoreBodyScroll();
  }

  closeBulkDeleteModal(): void {
    this.showBulkDeleteModal = false;
    this.restoreBodyScroll();
  }

  confirmDelete(): void {
    if (!this.pendingId) return;
    this.spinner.show();
    const request = this.pendingType === 'education'
      ? this.educationService.deleteEducation(this.pendingId)
      : this.experienceService.deleteExperience(this.pendingId);
    request.subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res?.success === false) {
          this.toastr.error(res?.message || 'Delete failed');
          return;
        }
        const selected = this.pendingType === 'education' ? this.selectedEducationIds : this.selectedExperienceIds;
        selected.delete(this.pendingId);
        this.closeDeleteModal();
        this.toastr.success(res?.message || 'Entry deleted');
        this.loadAllData();
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err?.error?.message || err?.message || 'Delete failed');
      }
    });
  }

  confirmBulkDelete(): void {
    const selected = this.pendingType === 'education' ? this.selectedEducationIds : this.selectedExperienceIds;
    if (!selected.size) return;
    this.spinner.show();
    const ids = Array.from(selected);
    const request = this.pendingType === 'education'
      ? this.educationService.deleteMultipleEducation(ids)
      : this.experienceService.deleteMultipleExperience(ids);
    request.subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res?.success === false) {
          this.toastr.error(res?.message || 'Bulk delete failed');
          return;
        }
        selected.clear();
        this.closeBulkDeleteModal();
        this.toastr.success(res?.message || 'Selected entries deleted');
        this.loadAllData();
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err?.error?.message || err?.message || 'Bulk delete failed');
      }
    });
  }

  edit(type: AboutRecordType, record: any): void {
    const id = this.getRecordId(record);
    if (id) this.router.navigate(['/about', type, 'edit', id]);
  }

  private restoreBodyScroll(): void {
    if (!this.showDeleteModal && !this.showBulkDeleteModal) document.body.style.overflow = '';
  }

  updateEducationStatus(data: any): void {
    this.toastr.clear();
    const isActive = data.isActive === false;
    this.spinner.show();
    this.educationService.updateEducation(data._id, { ...data, isActive }).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res?.success) {
          this.loadAllData();
          this.toastr.success(res?.message);
        } else {
          this.toastr.error(res?.message);
        }
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err?.error?.message || err?.message);
      }
    });
  }

  updateExperienceStatus(data: any): void {
    this.toastr.clear();
    const isActive = data.isActive === false;
    this.spinner.show();
    this.experienceService.updateExperience(data._id, { ...data, isActive }).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res?.success) {
          this.loadAllData();
          this.toastr.success(res?.message);
        } else {
          this.toastr.error(res?.message);
        }
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err?.error?.message || err?.message);
      }
    });
  }
}