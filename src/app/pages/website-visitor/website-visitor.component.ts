import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { VisitorService } from '../../services/visitor/visitor.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ThemeService } from '../../services/theme/theme.service';

@Component({
  selector: 'app-website-visitor',
  imports: [CommonModule],
  templateUrl: './website-visitor.component.html',
  styleUrl: './website-visitor.component.scss'
})
export class WebsiteVisitorComponent implements OnInit {
  visitors: any[] = [];

  page: number = 1;
  limit: number = 5;
  total: number = 0;
  totalPages: number = 1;

  private visitorService = inject(VisitorService);
  private spinner = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);
  themeService = inject(ThemeService);

  ngOnInit(): void {
    this.getVisitor();
  }

  getVisitor(): void {
    this.spinner.show();
    this.visitorService.getAllVisitors(this.page, this.limit).subscribe({
      next: (res: any) => {
        if (res?.success && res?.Visitors) {
          this.visitors = res?.Visitors || [];
          this.page = res.page || this.page;
          this.limit = res.limit || this.limit;
          this.total = res.total || 0;
          this.totalPages = res.totalPages || Math.max(1, Math.ceil(this.total / this.limit));
          this.spinner.hide();
          // this.toastr.success(res?.message);
        } else {
          this.spinner.hide();
          this.toastr.error(res?.message)
        }
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err.error.message || 'Failed to load visitor count');
      }
    });
  }

  changePage(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages || newPage === this.page) return;
    this.page = newPage;
    this.getVisitor();
  }

  setLimit(newLimit: number) {
    if (newLimit === this.limit) return;
    this.limit = newLimit;
    this.page = 1;
    this.getVisitor();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

}
