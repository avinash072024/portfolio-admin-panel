import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ServicesService } from '../../services/service/services.service';
import { ThemeService } from '../../services/theme/theme.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { SocketService } from '../../services/socket/socket.service';
import { TooltipDirective } from '../../directives/tooltip/tooltip.directive';
import { BackupService } from '../../services/backup/backup.service';
import { Constants } from '../../models/constants';

declare var $: any;

export interface Service {
  _id: string;
  title: string;
  icon: string;
  description: string;
  features: string[];
  isActive: boolean;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PaginationComponent, TooltipDirective],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit, OnDestroy {
  services: Service[] = [];
  page: number = 1;
  limit: number = 5;
  total: number = 0;
  totalPages: number = 1;
  pages: number[] = [];
  searchTerm: string = '';

  spinner = inject(NgxSpinnerService);
  toastr = inject(ToastrService);
  servicesService = inject(ServicesService);
  backupService = inject(BackupService);
  themeService = inject(ThemeService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  socketService = inject(SocketService);
  private destroy$ = new Subject<void>();

  deletingServiceId!: string;
  deletingServiceTitle!: string;
  private searchSubject = new Subject<string>();

  // Bulk delete
  selectedIds: Set<string> = new Set();
  showBulkDeleteModal: boolean = false;

  confirmDeleteStatement: string = Constants.DELETE_CONFIRM_STATEMENT1;
  confirmBulkDeleteStatement: string = Constants.DELETE_CONFIRM_STATEMENT2;

  delelteStatement1: string = Constants.DELETE_STATEMENT1;
  delelteStatement2: string = Constants.DELETE_STATEMENT2;
  delelteStatement3: string = Constants.DELETE_STATEMENT3;

  get allSelected(): boolean {
    return this.services.length > 0 && this.services.every(s => this.selectedIds.has(s._id));
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.services.forEach(s => this.selectedIds.delete(s._id));
    } else {
      this.services.forEach(s => this.selectedIds.add(s._id));
    }
  }

  toggleSelect(id: string): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  openBulkDeleteModal(): void {
    if (this.selectedIds.size === 0) return;
    this.showBulkDeleteModal = true;
    $('#DeleteConfirmationModal').modal('show');
  }

  closeBulkDeleteModal(): void {
    this.showBulkDeleteModal = false;
    $('#DeleteConfirmationModal').modal('hide');
  }

  confirmBulkDelete(): void {
    this.toastr.clear();
    this.spinner.show();
    const ids = Array.from(this.selectedIds);
    this.servicesService.deleteMultipleServices(ids).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.closeBulkDeleteModal();
          this.selectedIds.clear();
          this.page = 1;
          this.getServices();
          this.spinner.hide();
          this.toastr.success(res?.message);
        } else {
          this.spinner.hide();
          this.toastr.error(res?.message);
        }
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err?.error?.message || err?.message || 'Failed to delete services. Please try again.');
      }
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  ngOnInit(): void {
    this.page = Number(this.route.snapshot.queryParamMap.get('page')) || 1;
    this.getServices();
    this.subscribeToSocketUpdates();

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page = 1;
      this.getServices();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getServices(silent: boolean = false): void {
    if (!silent) {
      this.spinner.show();
      this.selectedIds.clear();
    }
    this.servicesService.getServices(this.page, this.limit, this.searchTerm).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.services = res?.services || [];
          this.page = res.page || this.page;
          this.limit = res.limit || this.limit;
          this.total = res.total || 0;
          this.totalPages = res.totalPages || Math.max(1, Math.ceil(this.total / this.limit));
          this.buildPages();
          this.spinner.hide();
        } else {
          this.spinner.hide();
          this.toastr.error(res?.message);
        }
      },
      error: (err: any) => {
        this.spinner.hide();
        // this.toastr.error(err.message);
        this.toastr.error(err?.error?.message || 'Failed to load services. Please try again.');
      },
    })
  }

  buildPages() {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    this.pages = pages;
  }

  changePage(p: number) {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.getServices();
  }

  setLimit(n: number) {
    this.limit = n;
    this.page = 1;
    this.getServices();
  }

  private subscribeToSocketUpdates(): void {
    this.socketService
      .onRefreshOrDataUpdated(['services', 'service'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getServices(true);
      });
  }

  clearSearch() {
    this.searchTerm = '';
    this.onSearch();
  }

  openDeleteModal(id: string, title: string) {
    this.deletingServiceId = id;
    this.deletingServiceTitle = title;
    this.showBulkDeleteModal = false;
    $('#DeleteConfirmationModal').modal('show');
  }

  closeDeleteModal() {
    this.showBulkDeleteModal = false;
    this.deletingServiceId = '';
    this.deletingServiceTitle = '';
    document.body.style.overflow = '';
    $('#DeleteConfirmationModal').modal('hide');
  }

  confirmDelete() {
    this.toastr.clear();
    this.spinner.show();
    this.servicesService.deleteService(this.deletingServiceId).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.closeDeleteModal();
          this.getServices();
          this.spinner.hide();
          this.toastr.success(res?.message);
        } else {
          this.spinner.hide();
          this.toastr.error(res?.message);
        }
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err?.message);
      }
    })
  }

  updateServiceStatus(service: Service): void {
    this.toastr.clear();
    const isActive = service.isActive === false;
    this.spinner.show();
    this.servicesService.updateService(service._id, { ...service, isActive }).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res?.success) {
          this.getServices(true);
          this.toastr.success(res?.message);
        } else {
          this.toastr.error(res?.message);
        }
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err?.error?.message || err?.message || 'Failed to update status. Please try again.');
      }
    });
  }
}
