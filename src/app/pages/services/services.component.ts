import { Component, inject, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ServicesService } from '../../services/service/services.service';
import { ThemeService } from '../../services/theme/theme.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

export interface Service {
  _id: string;
  title: string;
  icon: string;
  description: string;
  features: string[];
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit {
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
  themeService = inject(ThemeService);
  router = inject(Router);

  showDeleteModal: boolean = false;
  deletingServiceId!: string;
  deletingServiceTitle!: string;
  private searchSubject = new Subject<string>();

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  ngOnInit(): void {
    this.getServices();

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page = 1;
      this.getServices();
    });
  }

  getServices(): void {
    this.spinner.show();
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
        this.toastr.error(err.message);
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

  // onSearch() {
  //   this.page = 1;
  //   this.getServices();
  // }

  clearSearch() {
    this.searchTerm = '';
    this.onSearch();
  }

  openDeleteModal(id: string, title: string) {
    this.deletingServiceId = id;
    this.deletingServiceTitle = title;
    this.showDeleteModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deletingServiceId = '';
    this.deletingServiceTitle = '';
    document.body.style.overflow = '';
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
}
