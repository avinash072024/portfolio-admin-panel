import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as AOS from 'aos';
import { RouterLink } from '@angular/router';
import { VisitorService } from '../../services/visitor/visitor.service';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ProjectsService } from '../../services/projects/projects.service';
import { SkillsService } from '../../services/skills/skills.service';
import { forkJoin } from 'rxjs';

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
  private projectService = inject(ProjectsService);
  private skillsService = inject(SkillsService);
  private spinner = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);
  skillCount!: number;
  visitorCount!: number;
  projectCount!: number;

  ngOnInit() {
    AOS.init({ duration: 1000, once: true });
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // 1. Show the spinner once for all requests
    this.spinner.show();

    forkJoin({
      visitors: this.visitorService.getAllVisitors(),
      projects: this.projectService.getProjects(),
      skills: this.skillsService.getSkills()
    }).subscribe({
      next: (res: any) => {
        // 2. Hide the spinner once everything completes successfully
        this.spinner.hide();
        debugger;

        // --- Handle Visitors Data ---
        if (res.visitors?.success && res.visitors?.Visitors) {
          this.visitors = res.visitors.Visitors || [];
          this.visitorCount = res.visitors?.total || 0;
        } else {
          this.toastr.error(res.visitors?.message);
        }

        // --- Handle Projects Data ---
        if (res.projects?.success && res.projects?.projects) {
          this.projectCount = res.projects?.count || 0;
        } else {
          this.toastr.error(res.projects?.message);
        }

        // --- Handle Skills Data ---
        if (res.skills?.success && res.skills?.skills) {
          this.skillCount = res.skills?.count || 0;
        } else {
          this.toastr.error(res.skills?.message);
        }
      },
      error: (err: any) => {
        // 3. Hide the spinner if any request fails
        this.spinner.hide();

        const errorMessage = err?.error?.message || 'Failed to load dashboard data';
        this.toastr.error(errorMessage);
        console.error('API Error:', err);
      }
    });
  }

  // getVisitor(): void {
  //   this.spinner.show();
  //   this.visitorService.getAllVisitors().subscribe({
  //     next: (res: any) => {
  //       if (res?.success && res?.Visitors) {
  //         this.visitors = res?.Visitors || [];
  //         this.visitorCount = res?.Visitors?.count || 0;
  //         this.spinner.hide();
  //         // this.toastr.success(res?.message);
  //       } else {
  //         this.spinner.hide();
  //         this.toastr.error(res?.message)
  //       }
  //     },
  //     error: (err: any) => {
  //       this.spinner.hide();
  //       this.toastr.error(err.error.message || 'Failed to load visitor count');
  //     }
  //   });
  // }

  // getProject(): void {
  //   this.spinner.show();
  //   this.projectService.getProjects().subscribe({
  //     next: (res: any) => {
  //       if (res?.success && res?.Projects) {
  //         this.projectCount = res?.Projects?.count || 0;
  //         this.spinner.hide();
  //         // this.toastr.success(res?.message);
  //       } else {
  //         this.spinner.hide();
  //         this.toastr.error(res?.message)
  //       }
  //     },
  //     error: (err: any) => {
  //       this.spinner.hide();
  //       this.toastr.error(err.error.message || 'Failed to load project count');
  //     }
  //   });
  // }

  // getSkill(): void {
  //   this.spinner.show();
  //   this.skillsService.getSkills().subscribe({
  //     next: (res: any) => {
  //       if (res?.success && res?.Skills) {
  //         this.skillCount = res?.Skills?.count || 0;
  //         this.spinner.hide();
  //         // this.toastr.success(res?.message);
  //       } else {
  //         this.spinner.hide();
  //         this.toastr.error(res?.message)
  //       }
  //     },
  //     error: (err: any) => {
  //       this.spinner.hide();
  //       this.toastr.error(err.error.message || 'Failed to load skill count');
  //     }
  //   });
  // }
}