import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { ProjectsService } from '../../services/projects/projects.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

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
  projectService = inject(ProjectsService);
  toastr = inject(ToastrService);
  spinner = inject(NgxSpinnerService);
  showDeleteModal: boolean = false;
  deletingProjectId!: string;
  deletingProjectTitle!: string;

  ngOnInit(): void {
    this.getProjects();
  }

  getProjects(): void {
    this.spinner.show();
    this.projectService.getAllProjects().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.projects = res?.projects;
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

  onEdit(project: Project) {
    console.log('Editing project:', project.title);
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