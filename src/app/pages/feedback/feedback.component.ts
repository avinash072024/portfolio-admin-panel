import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FeedbackService } from '../../services/feedback/feedback.service';
import { ThemeService } from '../../services/theme/theme.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { AvatarService } from '../../services/avatar/avatar.service';

declare const bootstrap: any;

@Component({
  selector: 'app-feedback',
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.scss'
})

export class FeedbackComponent implements OnInit, OnDestroy {
  feedbacks: any[] = [];

  page: number = 1;
  limit: number = 5;
  total: number = 0;
  totalPages: number = 1;
  searchTerm: string = '';
  deletingFeedbackId: string = '';
  deletingFeedbackTitle: string = '';
  deleteModalInstance: any = null;

  feedbackService = inject(FeedbackService);
  spinner = inject(NgxSpinnerService);
  toastr = inject(ToastrService);
  avatarService = inject(AvatarService);
  themeService = inject(ThemeService);
  searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.getFeedbacks();

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page = 1;
      this.getFeedbacks();
    });
  }

  ngOnDestroy(): void {
    if (this.deleteModalInstance) {
      this.deleteModalInstance.hide();
      this.deleteModalInstance.dispose();
      this.deleteModalInstance = null;
    }
  }

  getFeedbacks(): void {
    this.spinner.show();
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

  openDeleteModal(feedback: any): void {
    const feedbackId = feedback?._id;
    if (!feedbackId) {
      this.toastr.error('Invalid feedback id');
      return;
    }

    this.deletingFeedbackId = feedbackId;
    this.deletingFeedbackTitle = feedback?.name || 'this feedback';

    const modalElement = document.getElementById('deleteFeedbackModal');
    if (!modalElement) {
      this.toastr.error('Delete modal not found');
      return;
    }

    this.deleteModalInstance = new bootstrap.Modal(modalElement, {
      backdrop: 'static',
      keyboard: false
    });
    this.deleteModalInstance.show();
  }

  closeDeleteModal(): void {
    this.deleteModalInstance?.hide();
    this.deletingFeedbackId = '';
    this.deletingFeedbackTitle = '';
  }

  confirmDeleteFeedback(): void {
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

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
