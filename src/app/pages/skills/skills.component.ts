import { Component, inject, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SkillsService } from '../../services/skills/skills.service';
import { ThemeService } from '../../services/theme/theme.service';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
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

  spinner = inject(NgxSpinnerService);
  toastr = inject(ToastrService);
  skillsService = inject(SkillsService);
  themeService = inject(ThemeService);

  ngOnInit(): void {
    this.getProjects();
  }

  getProjects(): void {
    this.spinner.show();
    this.skillsService.getAllSkills(this.page, this.limit).subscribe({
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
    this.getProjects();
  }

  prev() {
    if (this.page > 1) {
      this.page--;
      this.getProjects();
    }
  }

  next() {
    if (this.page < this.totalPages) {
      this.page++;
      this.getProjects();
    }
  }

  setLimit(n: number) {
    this.limit = n;
    this.page = 1;
    this.getProjects();
  }

  get rangeStart() {
    return ((this.page - 1) * this.limit) + 1;
  }

  get rangeEnd() {
    return Math.min(this.page * this.limit, this.total);
  }

}
