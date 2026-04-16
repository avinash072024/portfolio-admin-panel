import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme/theme.service';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
  @Input() page: number = 1;
  @Input() limit: number = 10;
  @Input() total: number = 0;
  @Input() totalPages: number = 1;

  @Output() pageChange = new EventEmitter<number>();
  @Output() limitChange = new EventEmitter<number>();

  themeService = inject(ThemeService);

  get visiblePages(): number[] {
    const total = this.totalPages;
    if (total <= 4) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    
    let startPage: number;
    let endPage: number;

    if (this.page <= 2) {
      startPage = 1;
      endPage = 4;
    } else if (this.page >= total - 1) {
      startPage = total - 3;
      endPage = total;
    } else {
      startPage = this.page - 1;
      // If we are at page 3, we show 2, 3, 4, 5
      endPage = this.page + 2; 
      if (endPage > total) {
        endPage = total;
      }
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  changePage(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages || newPage === this.page) return;
    this.pageChange.emit(newPage);
  }

  setLimit(newLimit: number) {
    if (newLimit === this.limit) return;
    this.limitChange.emit(newLimit);
  }
}
