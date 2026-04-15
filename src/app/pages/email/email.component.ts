import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { EmailService } from '../../services/email/email.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ThemeService } from '../../services/theme/theme.service';
import { AvatarService } from '../../services/avatar/avatar.service';

interface Email {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  contact: string;
  message: string;
  createdAt?: string;
  verified?: boolean;
}

@Component({
  selector: 'app-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './email.component.html',
  styleUrl: './email.component.scss'
})
export class EmailComponent implements OnInit {
  protected readonly Math = Math;
  emails: Email[] = [];
  page: number = 1;
  limit: number = 5;
  total: number = 0;
  totalPages: number = 1;
  
  emailService = inject(EmailService);
  avatarService = inject(AvatarService);
  themeService = inject(ThemeService);
  toastr = inject(ToastrService);
  spinner = inject(NgxSpinnerService);
  
  showDeleteModal: boolean = false;
  deletingEmailId!: string;
  deletingEmailName!: string;
  searchTerm: string = '';
  private searchSubject = new Subject<string>();

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.page = 1;
    this.getEmails();
  }
  
  ngOnInit(): void {
    this.getEmails();
    
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page = 1;
      this.getEmails();
    });
  }

  getEmails(): void {
    this.spinner.show();
    this.emailService.getAllEmail(this.page, this.limit, this.searchTerm).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.emails = res?.email || [];
          this.page = res.page || this.page;
          this.limit = res.limit || this.limit;
          this.total = res.total || 0;
          this.totalPages = res.totalPages || Math.max(1, Math.ceil(this.total / this.limit));
          this.spinner.hide();
        } else {
          this.spinner.hide();
          this.toastr.error("Error fetching emails");
        }
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err.message);
      },
    });
  }

  changePage(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages || newPage === this.page) return;
    this.page = newPage;
    this.getEmails();
  }

  setLimit(newLimit: number) {
    if (newLimit === this.limit) return;
    this.limit = newLimit;
    this.page = 1;
    this.getEmails();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  openDeleteModal(id: string, name: string) {
    this.deletingEmailId = id;
    this.deletingEmailName = name;
    this.showDeleteModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deletingEmailId = '';
    this.deletingEmailName = '';
    document.body.style.overflow = '';
  }

  confirmDelete() {
    this.toastr.clear();
    this.spinner.show();
    this.emailService.deleteEmail(this.deletingEmailId).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.closeDeleteModal();
          this.page = 1; // resetting to page 1 to avoid empty page lists after delete if it was the last item
          this.getEmails();
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
    });
  }
}
