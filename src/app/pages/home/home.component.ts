import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as AOS from 'aos';
import { RouterLink } from '@angular/router';
import { VisitorService } from '../../services/visitor/visitor.service';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ProjectsService } from '../../services/projects/projects.service';
import { SkillsService } from '../../services/skills/skills.service';
import { FeedbackService } from '../../services/feedback/feedback.service';
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
  feedbacks: any[] = [];
  visitorService = inject(VisitorService);
  projectService = inject(ProjectsService);
  skillsService = inject(SkillsService);
  feedbackService = inject(FeedbackService);
  spinner = inject(NgxSpinnerService);
  toastr = inject(ToastrService);
  skillCount: number = 0;
  visitorCount: number = 0;
  feedbackCount: number = 0;
  projectCount: number = 0;

  ngOnInit() {
    AOS.init({ duration: 1000, once: true });
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.spinner.show();

    forkJoin({
      visitors: this.visitorService.getAllVisitors(),
      projects: this.projectService.getProjects(),
      skills: this.skillsService.getSkills(),
      feedbacks: this.feedbackService.getAllFeedbacks()
    }).subscribe({
      next: (res: any) => {
        // 2. Hide the spinner once everything completes successfully
        this.spinner.hide();

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

        // --- Handle Feedback Data ---
        if (res.feedbacks?.success && res.feedbacks?.feedback) {
          this.feedbacks = res.feedbacks.feedback || [];
          this.feedbackCount = res.feedbacks?.total || 0;
        } else {
          this.toastr.error(res.feedbacks?.message || 'Failed to load feedback');
        }
      },
      error: (err: any) => {
        this.spinner.hide();

        const errorMessage = err?.error?.message || 'Failed to load dashboard data';
        this.toastr.error(errorMessage);
        console.error('API Error:', err);
      }
    });
  }
}