import { Component, inject, OnInit } from '@angular/core';
import { TooltipDirective } from '../../directives/tooltip/tooltip.directive';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { EducationService } from '../../services/education/education.service';
import { ExperienceService } from '../../services/experience/experience.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { SocketService } from '../../services/socket/socket.service';
import { ServicesService } from '../../services/service/services.service';
import { ProjectsService } from '../../services/projects/projects.service';
import { SkillsService } from '../../services/skills/skills.service';
import { FeedbackService } from '../../services/feedback/feedback.service';
import { VisitorService } from '../../services/visitor/visitor.service';
import { BackupService } from '../../services/backup/backup.service';

interface DataBackup {
  id: number;
  sectionTitle: string;
}

@Component({
  selector: 'app-data-backup',
  imports: [TooltipDirective],
  templateUrl: './data-backup.component.html',
  styleUrl: './data-backup.component.scss'
})
export class DataBackupComponent implements OnInit {
  dataBackupTable: DataBackup[] = [];

  private educationService = inject(EducationService);
  private experienceService = inject(ExperienceService);
  private servicesService = inject(ServicesService);
  private projectService = inject(ProjectsService);
  private skillsService = inject(SkillsService);
  private feedbackService = inject(FeedbackService);
  private visitorService = inject(VisitorService);
  private backupService = inject(BackupService);

  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private socketService = inject(SocketService);
  // private router = inject(Router);
  private destroy$ = new Subject<void>();

  educations: any[] = [];
  experiences: any[] = [];
  services: any[] = [];
  projects: any[] = [];
  skills: any[] = [];
  feedbacks: any[] = [];
  visitors: any[] = [];

  ngOnInit(): void {
    this.dataBackupTable = [
      { id: 1, sectionTitle: 'Education' },
      { id: 2, sectionTitle: 'Experience' },
      { id: 3, sectionTitle: 'Services' },
      { id: 4, sectionTitle: 'Projects' },
      { id: 5, sectionTitle: 'Skills' },
      { id: 6, sectionTitle: 'Visitor' },
      { id: 7, sectionTitle: 'Feedback' }
    ]

    this.loadAllData();
    this.socketService
      .onRefreshOrDataUpdated(['educations', 'education', 'experiences', 'experience', 'services', 'service', 'projects', 'project', 'skills', 'skill', 'feedbacks', 'feedback', 'visitors', 'visitor'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadAllData());
  }

  loadAllData(): void {
    this.spinner.show();
    forkJoin({
      educations: this.educationService.getEducation(),
      experiences: this.experienceService.getExperience(),
      services: this.servicesService.getServices(),
      projects: this.projectService.getProjectsAll(),
      skills: this.skillsService.getSkillsAll(),
      feedbacks: this.feedbackService.getFeedbacks(),
      visitors: this.visitorService.getVisitor()
    }).subscribe({
      next: (res: any) => {
        this.educations = res.educations?.educations || res.educations || [];
        this.experiences = res.experiences?.experiences || res.experiences || [];
        this.services = res.services?.services || res?.services || [];
        this.projects = res.projects?.projects || res?.projects || [];
        this.skills = res.skills?.skills || res?.skills || [];
        this.feedbacks = res.feedbacks?.feedback || res?.feedback || [];
        this.visitors = res.visitors?.Visitors || res?.Visitors || [];

        this.spinner.hide();
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err?.error?.message || 'Failed to load about details. Please try again.');
      }
    });
  }

  commonDownloadClick(section: string): void {
    switch (section) {
      case 'Education':
        this.downloadBackup(this.educations, section);
        break;
      case 'Experience':
        this.downloadBackup(this.experiences, section);
        break;
      case 'Services':
        this.downloadBackup(this.services, section);
        break;
      case 'Projects':
        this.downloadBackup(this.projects, section);
        break;
      case 'Skills':
        this.downloadBackup(this.skills, section);
        break;
      case 'Visitor':
        this.downloadBackup(this.visitors, section);
        break;
      case 'Feedback':
        this.downloadBackup(this.feedbacks, section);
        break;
      default:

    }
  }

  downloadBackup(data: any, fileNamePrefix: string): void {
    this.backupService.downloadJson(data, fileNamePrefix);
    this.toastr.success(`${fileNamePrefix} backup downloaded successfully`)
  }
}
