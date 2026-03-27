import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { VisitorService } from '../../services/visitor/visitor.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-website-visitor',
  imports: [CommonModule],
  templateUrl: './website-visitor.component.html',
  styleUrl: './website-visitor.component.scss'
})
export class WebsiteVisitorComponent implements OnInit {
  visitors: any[] = [];

  private visitorService = inject(VisitorService);
  private spinner = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.getVisitor();
  }

  getVisitor(): void {
    this.spinner.show();
    this.visitorService.getVisitor().subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          this.visitors = res.data;
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
