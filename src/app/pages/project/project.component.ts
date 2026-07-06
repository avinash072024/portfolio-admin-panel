import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ProjectsService } from '../../services/projects/projects.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ThemeService } from '../../services/theme/theme.service';
import { PaginationComponent } from '../../components/pagination/pagination.component';

interface Project {
  _id: string;
  title: string;
  category: string;
  completedYear: string;
  desc: string[];
  image?: string;
  tools: string[];
  link?: string;
}

@Component({
  selector: 'app-project',
  imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss'
})
export class ProjectComponent implements OnInit {
  protected readonly Math = Math;
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
  route = inject(ActivatedRoute);
  showDeleteModal: boolean = false;
  deletingProjectId!: string;
  deletingProjectTitle!: string;
  searchTerm: string = '';

  // Bulk delete
  selectedIds: Set<string> = new Set();
  showBulkDeleteModal: boolean = false;
  private searchSubject = new Subject<string>();

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.page = 1;
    this.getProjects();
  }
  
  ngOnInit(): void {
    this.page = Number(this.route.snapshot.queryParamMap.get('page')) || 1;
    this.getProjects();
    
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page = 1;
      this.getProjects();
    });
  }

  getProjects(): void {
    this.spinner.show();
    this.selectedIds.clear();
    this.projectService.getAllProjects(this.page, this.limit, this.searchTerm).subscribe({
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
    this.router.navigate(['/edit-project', project._id], { queryParams: { page: this.page } });
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

  get allSelected(): boolean {
    return this.projects.length > 0 && this.projects.every(p => this.selectedIds.has(p._id));
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.projects.forEach(p => this.selectedIds.delete(p._id));
    } else {
      this.projects.forEach(p => this.selectedIds.add(p._id));
    }
  }

  toggleSelect(id: string): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  openBulkDeleteModal(): void {
    if (this.selectedIds.size === 0) return;
    this.showBulkDeleteModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeBulkDeleteModal(): void {
    this.showBulkDeleteModal = false;
    document.body.style.overflow = '';
  }

  confirmBulkDelete(): void {
    this.toastr.clear();
    this.spinner.show();
    const ids = Array.from(this.selectedIds);
    this.projectService.deleteMultipleProjects(ids).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.closeBulkDeleteModal();
          this.selectedIds.clear();
          this.page = 1;
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
        this.toastr.error(err?.error?.message || err?.message);
      }
    });
  }
}