import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { VisitorService } from '../../services/visitor/visitor.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ThemeService } from '../../services/theme/theme.service';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { CustomDatepickerComponent } from '../../components/custom-datepicker/custom-datepicker.component';

@Component({
  selector: 'app-website-visitor',
  imports: [CommonModule, PaginationComponent, CustomDatepickerComponent],
  templateUrl: './website-visitor.component.html',
  styleUrl: './website-visitor.component.scss'
})
export class WebsiteVisitorComponent implements OnInit {
  dateFilter: string = '';
  allVisitors: any[] = [];
  filteredVisitors: any[] = [];
  dataRecieved: boolean = false;

  visitors: any[] = [];

  page: number = 1;
  limit: number = 5;
  total: number = 0;
  totalPages: number = 1;

  private visitorService = inject(VisitorService);
  private spinner = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);
  themeService = inject(ThemeService);

  pushSupported = false;
  pushSubscribed = false;
  pushActionInProgress = false;

  ngOnInit(): void {
    this.getVisitor();
  }

  getVisitor(): void {
    this.spinner.show();
    this.visitorService.getAllVisitors(1, 10000).subscribe({
      next: (res: any) => {
        if (res?.success && res?.Visitors) {
          this.allVisitors = res?.Visitors || [];
          this.applyFilter();
          this.dataRecieved = true;
          this.spinner.hide();
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

  onDateFilterChange(dateStr: string) {
    this.dateFilter = dateStr;
    this.page = 1;
    this.applyFilter();
  }

  applyFilter() {
    let tempVisitors = [...this.allVisitors];

    if (this.dateFilter) {
      tempVisitors = tempVisitors.filter(v => {
        const d = new Date(v.createdAt);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        return dateStr === this.dateFilter;
      });
    }

    this.filteredVisitors = tempVisitors;
    this.total = this.filteredVisitors.length;
    this.totalPages = Math.max(1, Math.ceil(this.total / this.limit));
    this.updatePagination();
  }

  updatePagination() {
    const startIndex = (this.page - 1) * this.limit;
    const endIndex = startIndex + this.limit;
    this.visitors = this.filteredVisitors.slice(startIndex, endIndex);
  }

  changePage(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages || newPage === this.page) return;
    this.page = newPage;
    this.updatePagination();
  }

  setLimit(newLimit: number) {
    if (newLimit === this.limit) return;
    this.limit = newLimit;
    this.page = 1;
    this.totalPages = Math.max(1, Math.ceil(this.total / this.limit));
    this.updatePagination();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  deleteDuplicateVisitors(): void {
    this.spinner.show();
    this.visitorService.deleteDuplicateVisitors().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res?.success) {
          this.toastr.success(res?.message || 'Duplicate visitors deleted successfully');
          this.getVisitor(); // Refresh the visitor list after deletion
        } else {
          this.toastr.error(res?.message || 'Failed to delete duplicate visitors');
        }
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err.error.message || 'Failed to delete duplicate visitors');
      }
    });
  }

}
