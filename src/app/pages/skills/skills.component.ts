import { Component, inject, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SkillsService } from '../../services/skills/skills.service';
import { ThemeService } from '../../services/theme/theme.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { PaginationComponent } from '../../components/pagination/pagination.component';

export interface Skill {
  _id: string;
  name: string;
  icon: string;
  level: number;
  color: string;
  category: string;
}

@Component({
  selector: 'app-skills',
  imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss'
})
export class SkillsComponent implements OnInit {
  skills: Skill[] = [];
  page: number = 1;
  limit: number = 5;
  total: number = 0;
  totalPages: number = 1;
  pages: number[] = [];
  searchTerm: string = '';
  private searchSubject = new Subject<string>();

  spinner = inject(NgxSpinnerService);
  toastr = inject(ToastrService);
  skillsService = inject(SkillsService);
  themeService = inject(ThemeService);
  router = inject(Router);

  showDeleteModal: boolean = false;
  deletingSkillId!: string;
  deletingSkillTitle!: string;

  ngOnInit(): void {
    this.getSkills();

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page = 1;
      this.getSkills();
    });
  }

  getSkills(): void {
    this.spinner.show();
    this.skillsService.getAllSkills(this.page, this.limit, this.searchTerm).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.skills = res?.skills || [];
          this.page = res.page || this.page;
          this.limit = res.limit || this.limit;
          this.total = res.total || 0;
          this.totalPages = res.totalPages || Math.max(1, Math.ceil(this.total / this.limit));
          this.buildPages();
          this.spinner.hide();
        } else {
          this.spinner.hide();
          this.toastr.error(res?.message);
        }
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err.message);
      },
    })
  }

  onSearch(): void {
    // this.page = 1;
    // this.getSkills();
    this.searchSubject.next(this.searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  buildPages() {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    this.pages = pages;
  }

  changePage(p: number) {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.getSkills();
  }

  prev() {
    if (this.page > 1) {
      this.page--;
      this.getSkills();
    }
  }

  next() {
    if (this.page < this.totalPages) {
      this.page++;
      this.getSkills();
    }
  }

  setLimit(n: number) {
    this.limit = n;
    this.page = 1;
    this.getSkills();
  }

  get rangeStart() {
    return ((this.page - 1) * this.limit) + 1;
  }

  get rangeEnd() {
    return Math.min(this.page * this.limit, this.total);
  }

  onDelete(id: string) {
    // fallback method (kept for API compatibility) — opens the modal
    this.openDeleteModal(id, 'this project');
  }

  openDeleteModal(id: string, title: string) {
    this.deletingSkillId = id;
    this.deletingSkillTitle = title;
    this.showDeleteModal = true;
    // prevent body scroll when modal open
    document.body.style.overflow = 'hidden';
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deletingSkillId = '';
    this.deletingSkillTitle = '';
    document.body.style.overflow = '';
  }

  confirmDelete() {
    this.toastr.clear();
    this.spinner.show();
    this.skillsService.deleteSkill(this.deletingSkillId).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.closeDeleteModal();
          this.getSkills();
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
