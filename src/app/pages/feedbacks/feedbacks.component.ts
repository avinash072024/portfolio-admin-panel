import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FeedbackService } from '../../services/feedback/feedback.service';
import { BackupService } from '../../services/backup/backup.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { AvatarService } from '../../services/avatar/avatar.service';
import { SocketService } from '../../services/socket/socket.service';
import { ThemeService } from '../../services/theme/theme.service';
import { TooltipDirective } from '../../directives/tooltip/tooltip.directive';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { Constants } from '../../models/constants';

declare var $: any;

@Component({
  selector: 'app-feedbacks',
  imports: [CommonModule, FormsModule, PaginationComponent, TooltipDirective],
  templateUrl: './feedbacks.component.html',
  styleUrl: './feedbacks.component.scss'
})
export class FeedbacksComponent implements OnInit, OnDestroy {
  feedbacks: any[] = [];

  page: number = 1;
  limit: number = 5;
  total: number = 0;
  totalPages: number = 1;
  searchTerm: string = '';
  deletingFeedbackId: string = '';
  deletingFeedbackTitle: string = '';
  selectedIds: Set<string> = new Set<string>();

  feedbackService = inject(FeedbackService);
  backupService = inject(BackupService);
  spinner = inject(NgxSpinnerService);
  toastr = inject(ToastrService);
  avatarService = inject(AvatarService);
  themeService = inject(ThemeService);
  socketService = inject(SocketService);
  private destroy$ = new Subject<void>();
  searchSubject = new Subject<string>();

  // Bulk delete
  showBulkDeleteModal: boolean = false;

  confirmDeleteStatement: string = Constants.DELETE_CONFIRM_STATEMENT1;
  confirmBulkDeleteStatement: string = Constants.DELETE_CONFIRM_STATEMENT2;

  delelteStatement1: string = Constants.DELETE_STATEMENT1;
  delelteStatement2: string = Constants.DELETE_STATEMENT2;
  delelteStatement3: string = Constants.DELETE_STATEMENT3;

  get allSelected(): boolean {
    return this.feedbacks.length > 0 && this.feedbacks.every((feedback) => this.selectedIds.has(feedback._id));
  }

  ngOnInit(): void {
    this.getFeedbacks();
    this.subscribeToSocketUpdates();

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page = 1;
      this.getFeedbacks();
    });
  }

  getFeedbacks(silent: boolean = false): void {
    if (!silent) {
      this.spinner.show();
      this.selectedIds.clear();
    }
    this.feedbackService.getAllFeedbacks(this.page, this.limit, this.searchTerm).subscribe({
      next: (res: any) => {
        this.spinner.hide();

        if (res?.success && res?.feedback) {
          this.feedbacks = res.feedback || [];
          this.page = res.page || this.page;
          this.limit = res.limit || this.limit;
          this.total = res.total ?? res.count ?? this.feedbacks.length;
          this.totalPages = res.totalPages || Math.max(1, Math.ceil(this.total / this.limit));
        } else {
          this.feedbacks = [];
          this.total = 0;
          this.totalPages = 1;
          this.toastr.error(res?.message || 'Failed to load feedback');
        }
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err?.error?.message || 'Failed to load feedback');
      }
    });
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.feedbacks.forEach((feedback) => this.selectedIds.delete(feedback._id));
      return;
    }

    this.feedbacks.forEach((feedback) => this.selectedIds.add(feedback._id));
  }

  toggleSelect(id: string): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
      return;
    }

    this.selectedIds.add(id);
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  clearSearch(): void {
    if (!this.searchTerm) return;
    this.searchTerm = '';
    this.page = 1;
    this.getFeedbacks();
  }

  changePage(newPage: number): void {
    if (newPage < 1 || newPage > this.totalPages || newPage === this.page) return;
    this.page = newPage;
    this.getFeedbacks();
  }

  setLimit(newLimit: number): void {
    if (newLimit === this.limit) return;
    this.limit = newLimit;
    this.page = 1;
    this.getFeedbacks();
  }

  openDeleteModal(id: string, title: string) {
    this.deletingFeedbackId = id;
    this.deletingFeedbackTitle = title;
    this.showBulkDeleteModal = false;
    $('#DeleteConfirmationModal').modal('show');
  }

  openBulkDeleteModal(): void {
    if (this.selectedIds.size === 0) return;
    this.showBulkDeleteModal = true;
    $('#DeleteConfirmationModal').modal('show');
  }

  closeDeleteModal() {
    this.showBulkDeleteModal = false;
    this.deletingFeedbackId = '';
    this.deletingFeedbackTitle = '';
    document.body.style.overflow = '';
    $('#DeleteConfirmationModal').modal('hide');
  }

  confirmDelete(): void {
    if (!this.deletingFeedbackId) {
      this.toastr.error('Invalid feedback id');
      return;
    }

    this.spinner.show();
    this.feedbackService.deleteFeedback(this.deletingFeedbackId).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res?.success) {
          this.closeDeleteModal();
          if (this.feedbacks.length === 1 && this.page > 1) {
            this.page -= 1;
          }
          this.toastr.success(res?.message || 'Feedback deleted successfully');
          this.getFeedbacks();
          return;
        }
        this.toastr.error(res?.message || 'Failed to delete feedback');
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err?.error?.message || 'Failed to delete feedback');
      }
    });
  }

  confirmBulkDelete(): void {
    const ids = Array.from(this.selectedIds);
    if (!ids.length) {
      this.toastr.error('Please select feedback to delete');
      return;
    }

    this.spinner.show();
    this.feedbackService.deleteMultipleFeedbacks(ids).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res?.success) {
          this.closeDeleteModal();
          this.selectedIds.clear();
          this.page = 1;
          this.getFeedbacks();
          this.toastr.success(res?.message || 'Selected feedback deleted successfully');
          return;
        }
        this.toastr.error(res?.message || 'Failed to delete selected feedback');
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err?.error?.message || 'Failed to delete selected feedback');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  private subscribeToSocketUpdates(): void {
    this.socketService
      .onRefreshOrDataUpdated(['feedback', 'feedbacks'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getFeedbacks(true);
      });
  }

  onUpdateVerified(feedback: any): void {
    const feedbackId = feedback?._id;
    if (!feedbackId) {
      this.toastr.error('Invalid feedback id');
      return;
    }

    const nextVerifiedValue = !Boolean(feedback?.verified);
    this.spinner.show();
    this.feedbackService.updateFeedbackVerified(feedbackId, nextVerifiedValue).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res?.success) {
          feedback.verified = nextVerifiedValue;
          this.toastr.success(res?.message || 'Feedback verification status updated successfully');
          return;
        }
        this.toastr.error(res?.message || 'Failed to update feedback verification status');
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err?.error?.message || 'Failed to update feedback verification status');
      }
    });
  }

  bulkVerifySelected(verified: boolean): void {
    const ids = Array.from(this.selectedIds);
    if (!ids.length) {
      this.toastr.error('Please select feedback to update');
      return;
    }

    this.spinner.show();
    this.feedbackService.updateMultipleFeedbackVerified(ids, verified).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res?.success) {
          this.selectedIds.clear();
          this.getFeedbacks();
          this.toastr.success(res?.message || 'Feedback verification status updated successfully');
          return;
        }
        this.toastr.error(res?.message || 'Failed to update feedback verification status');
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err?.error?.message || 'Failed to update feedback verification status');
      }
    });
  }

}
