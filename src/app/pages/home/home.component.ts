import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as AOS from 'aos';
import { RouterLink } from '@angular/router';
import { VisitorService } from '../../services/visitor/visitor.service';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  // Analytics Data
  stats = [
    { label: 'Total Projects', count: 42, icon: 'bi-kanban', color: 'primary' },
    { label: 'Skills Mastered', count: 18, icon: 'bi-award', color: 'success' },
    { label: 'Site Visitors', count: 1250, icon: 'bi-people', color: 'info' },
    { label: 'Resume Downloads', count: 89, icon: 'bi-cloud-download', color: 'warning' }
  ];

  visitors: any[] = [];
  private visitorService = inject(VisitorService);
  private spinner = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);

  ngOnInit() {
    AOS.init({ duration: 1000, once: true });
    this.getVisitor();
  }

  getVisitor(): void {
    this.spinner.show();
    this.visitorService.getAllVisitors().subscribe({
      next: (res: any) => {
        if (res?.success && res?.Visitors) {
          this.visitors = res?.Visitors || [];
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
}