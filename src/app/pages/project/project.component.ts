import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { ProjectsService } from '../../services/projects/projects.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ThemeService } from '../../services/theme/theme.service';

interface Project {
  _id: string;
  title: string;
  category: string;
  date: string;
  desc: string[];
  image?: string;
  tools: string[];
  link?: string;
}

@Component({
  selector: 'app-project',
  imports: [CommonModule, RouterLink],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss'
})
export class ProjectComponent implements OnInit {
  projects: Project[] = [];
  // pagination state
  page: number = 1;
  limit: number = 5;
  total: number = 0;
  totalPages: number = 1;
  projectService = inject(ProjectsService);
  themeService = inject(ThemeService);
  toastr = inject(ToastrService);
  spinner = inject(NgxSpinnerService);
  router = inject(Router);
  showDeleteModal: boolean = false;
  deletingProjectId!: string;
  deletingProjectTitle!: string;

  ngOnInit(): void {
    this.getProjects();
  }

  getProjects(): void {
    this.spinner.show();
    this.projectService.getAllProjects(this.page, this.limit).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.projects = res?.projects || [];
          this.page = res.page || this.page;
          this.limit = res.limit || this.limit;
          this.total = res.total || 0;
          this.totalPages = res.totalPages || Math.max(1, Math.ceil(this.total / this.limit));
          this.spinner.hide()
        } else {
          // this.toasterService.showError('Error');
          this.spinner.hide();
          this.toastr.error("Error");
        }
      },
      error: (err: any) => {
        // this.toasterService.showError(err.message)
        this.spinner.hide();
        this.toastr.error(err.message);
      },
    })
  }

  changePage(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages || newPage === this.page) return;
    this.page = newPage;
    this.getProjects();
  }

  setLimit(newLimit: number) {
    if (newLimit === this.limit) return;
    this.limit = newLimit;
    this.page = 1;
    this.getProjects();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onEdit(project: Project) {
    // navigate to add-edit page with project id for editing
    this.router.navigate(['/edit-project', project._id]);
  }

  onDelete(id: string) {
    // fallback method (kept for API compatibility) — opens the modal
    this.openDeleteModal(id, 'this project');
  }

  openDeleteModal(id: string, title: string) {
    this.deletingProjectId = id;
    this.deletingProjectTitle = title;
    this.showDeleteModal = true;
    // prevent body scroll when modal open
    document.body.style.overflow = 'hidden';
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deletingProjectId = '';
    this.deletingProjectTitle = '';
    document.body.style.overflow = '';
  }

  confirmDelete() {
    this.toastr.clear();
    this.spinner.show();
    this.projectService.deleteProject(this.deletingProjectId).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.closeDeleteModal();
          this.getProjects();
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
    })
  }
}