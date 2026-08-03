import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { VisitorService } from '../../services/visitor/visitor.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ThemeService } from '../../services/theme/theme.service';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { CustomDatepickerComponent } from '../../components/custom-datepicker/custom-datepicker.component';
import { SocketService } from '../../services/socket/socket.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-website-visitor',
  imports: [CommonModule, PaginationComponent, CustomDatepickerComponent],
  templateUrl: './website-visitor.component.html',
  styleUrl: './website-visitor.component.scss'
})
export class WebsiteVisitorComponent implements OnInit, OnDestroy {
  dateFilter: string = '';
  dataRecieved: boolean = false;
  showDeleteModal: boolean = false;

  visitors: any[] = [];

  page: number = 1;
  limit: number = 5;
  total: number = 0;
  totalPages: number = 1;

  private visitorService = inject(VisitorService);
  private spinner = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);
  themeService = inject(ThemeService);
  private socketService = inject(SocketService);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadVisitors(true);
    this.subscribeToSocketUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadVisitors(showSpinner: boolean): void {
    if (showSpinner) {
      this.spinner.show();
    }

    const date = this.dateFilter || undefined;

    this.visitorService.clearCache();
    this.visitorService.getAllVisitors(this.page, this.limit, date).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res?.success) {
          this.visitors = res?.Visitors ?? [];
          this.total = res?.total ?? 0;
          this.totalPages = res?.totalPages ?? Math.max(1, Math.ceil(this.total / this.limit));
          this.dataRecieved = true;
        } else {
          this.toastr.error(res?.message || 'Failed to load visitors');
        }
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err?.error?.message || 'Failed to load visitors');
      }
    });
  }

  onDateFilterChange(dateStr: string): void {
    this.dateFilter = dateStr;
    this.page = 1;
    this.loadVisitors(true);
  }

  changePage(newPage: number): void {
    if (newPage < 1 || newPage > this.totalPages || newPage === this.page) return;
    this.page = newPage;
    this.loadVisitors(true);
  }

  setLimit(newLimit: number): void {
    if (newLimit === this.limit) return;
    this.limit = newLimit;
    this.page = 1;
    this.loadVisitors(true);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  deleteDuplicateVisitors(): void {
    this.spinner.show();
    this.visitorService.deleteDuplicateVisitors().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.closeDeleteModal();
        if (res?.success) {
          this.toastr.success(res?.message || 'Duplicate visitors deleted successfully');
          this.page = 1;
          this.loadVisitors(false);
        } else {
          this.toastr.error(res?.message || 'Failed to delete duplicate visitors');
        }
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err?.error?.message || 'Failed to delete duplicate visitors');
      }
    });
  }

  openDeleteModal(): void {
    this.showDeleteModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    document.body.style.overflow = '';
  }

  private subscribeToSocketUpdates(): void {
    this.socketService
      .onRefreshOrDataUpdated(['visitor', 'visitors'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadVisitors(true);
      });
  }
}

