import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { ProjectsService } from '../../services/projects/projects.service';
import { ToastService } from '../../services/toast/toast.service';

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
  toasterService = inject(ToastService);
  showDeleteModal: boolean = false;
  deletingProjectId!: string;
  deletingProjectTitle!: string;

  ngOnInit(): void {
    // Ideally fetched from your MongoDB via an Angular Service
    // this.projects = [
    //   {
    //     _id: '1',
    //     title: 'Portfolio Admin',
    //     category: 'Web Development',
    //     date: '2026-01-15',
    //     desc: ['Modern admin panel with light/dark mode', 'Responsive design'],
    //     tools: ['Angular', 'Bootstrap', 'MongoDB'],
    //     link: 'https://example.com'
    //   }
    // ];

    this.getProjects();
  }

  getProjects(): void {
    this.projectService.getAllProjects().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.projects = res?.projects;
        } else {
          this.toasterService.showError('Error');
        }
      },
      error: (err: any) => {
        this.toasterService.showError(err.message)
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
    // Replace with actual delete API call when available

    // console.log('Confirmed delete ID:', this.deletingProjectId);
    // this.toasterService.showSuccess('Project deleted');
    // this.closeDeleteModal();

    // Optionally refresh list
    // this.getProjects();

    this.projectService.deleteProject(this.deletingProjectId).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.closeDeleteModal();
          this.getProjects();
          this.toasterService.showSuccess(res?.message);
        } else {
          this.toasterService.showSuccess(res?.message);
        }
      },
      error: (err: any) => {
        this.toasterService.showSuccess(err?.message);
      }
    })
  }
}