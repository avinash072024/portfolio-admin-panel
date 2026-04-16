import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewInit, effect } from '@angular/core';
import { Chart, registerables } from 'chart.js/auto';
Chart.register(...registerables);
import { CommonModule } from '@angular/common';
import * as AOS from 'aos';
import { RouterLink } from '@angular/router';
import { VisitorService } from '../../services/visitor/visitor.service';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ProjectsService } from '../../services/projects/projects.service';
import { SkillsService } from '../../services/skills/skills.service';
import { FeedbackService } from '../../services/feedback/feedback.service';
import { EmailService } from '../../services/email/email.service';
import { forkJoin } from 'rxjs';
import { AvatarService } from '../../services/avatar/avatar.service';
import { ThemeService } from '../../services/theme/theme.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('trafficChart') trafficChartCanvas!: ElementRef<HTMLCanvasElement>;
  chart: Chart | undefined;
  allVisitorsForChart: any[] = [];
  themeService = inject(ThemeService);
  // Analytics Data
  stats = [
    { label: 'Total Projects', count: 42, icon: 'bi-kanban', color: 'primary' },
    { label: 'Skills Mastered', count: 18, icon: 'bi-award', color: 'success' },
    { label: 'Site Visitors', count: 1250, icon: 'bi-people', color: 'info' },
    { label: 'Resume Downloads', count: 89, icon: 'bi-cloud-download', color: 'warning' }
  ];

  visitors: any[] = [];
  feedbacks: any[] = [];
  emails: any[] = [];
  visitorService = inject(VisitorService);
  projectService = inject(ProjectsService);
  skillsService = inject(SkillsService);
  feedbackService = inject(FeedbackService);
  avatarService = inject(AvatarService);
  emailService = inject(EmailService);
  spinner = inject(NgxSpinnerService);
  toastr = inject(ToastrService);

  constructor() {
    // Automatically re-initialize chart when theme or skin changes
    effect(() => {
      this.themeService.theme(); // track theme change
      this.themeService.skin();  // track skin change
      
      if (this.allVisitorsForChart.length > 0) {
        // Wait a small bit for CSS transitions/variables to update in DOM
        setTimeout(() => {
          this.initChart(this.allVisitorsForChart);
        }, 100);
      }
    });
  }
  skillCount: number = 0;
  visitorCount: number = 0;
  feedbackCount: number = 0;
  emailCount: number = 0;
  projectCount: number = 0;

  ngOnInit() {
    AOS.init({ duration: 1000, once: true });
    this.loadDashboardData();
  }

  ngAfterViewInit() {
    // Chart will be initialized after data is loaded
  }

  loadDashboardData(): void {
    this.spinner.show();

    forkJoin({
      visitors: this.visitorService.getAllVisitors(1, 100), // Get last 100 visitors for the chart
      projects: this.projectService.getProjects(),
      skills: this.skillsService.getSkills(),
      feedbacks: this.feedbackService.getAllFeedbacks(),
      emails: this.emailService.getAllEmail()
    }).subscribe({
      next: (res: any) => {
        // 2. Hide the spinner once everything completes successfully
        this.spinner.hide();

        // --- Handle Visitors Data ---
        if (res.visitors?.success && res.visitors?.Visitors) {
          this.visitors = (res.visitors.Visitors || []).slice(0, 5); // Keep only 5 for the table
          this.visitorCount = res.visitors?.total || 0;
          this.allVisitorsForChart = res.visitors.Visitors || [];
          this.initChart(this.allVisitorsForChart);
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

        // --- Handle Emails Data ---
        if (res.emails?.success && res.emails?.email) {
          this.emails = res.emails.email || [];
          this.emailCount = res.emails?.total || 0;
        } else {
          this.toastr.error(res.emails?.message || 'Failed to load emails');
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

  initChart(allVisitors: any[]): void {
    if (!this.trafficChartCanvas) return;

    const ctx = this.trafficChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Get dynamic colors from computed styles
    const styles = getComputedStyle(document.documentElement);
    const primaryColor = styles.getPropertyValue('--bs-primary').trim() || '#0d6efd';
    const primaryRGB = styles.getPropertyValue('--bs-primary-rgb').trim() || '13, 110, 253';
    const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';

    const tickColor = isDark ? '#adb5bd' : '#6c757d';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const tooltipBg = isDark ? '#2b3035' : '#fff';
    const tooltipText = isDark ? '#f8f9fa' : '#333';

    // Process data for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const dataMap = new Map<string, number>();
    last7Days.forEach(day => dataMap.set(day, 0));

    allVisitors.forEach(v => {
      const date = new Date(v.createdAt).toISOString().split('T')[0];
      if (dataMap.has(date)) {
        dataMap.set(date, (dataMap.get(date) || 0) + 1);
      }
    });

    const labels = last7Days.map(day => {
      const date = new Date(day);
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    });
    const counts = last7Days.map(day => dataMap.get(day) || 0);

    if (this.chart) {
      this.chart.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, `rgba(${primaryRGB}, 0.3)`);
    gradient.addColorStop(1, `rgba(${primaryRGB}, 0)`);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Visitors',
          data: counts,
          borderColor: primaryColor,
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: primaryColor,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: tooltipBg,
            titleColor: tooltipText,
            theme: isDark ? 'dark' : 'light',
            bodyColor: tooltipText,
            borderColor: gridColor,
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: (context: any) => ` ${context.parsed.y} Visitors`
            }
          } as any
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: tickColor, font: { size: 12 } }
          },
          y: {
            beginAtZero: true,
            grid: { color: gridColor },
            ticks: {
              precision: 0,
              color: tickColor,
              font: { size: 12 }
            }
          }
        }
      }
    });
  }
}