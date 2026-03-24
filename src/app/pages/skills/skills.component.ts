import { Component, inject, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SkillsService } from '../../services/skills/skills.service';

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
  imports: [],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss'
})
export class SkillsComponent implements OnInit {
  skills: Skill[] = [];
  page: number = 1;
  limit: number = 5;
  total: number = 0;
  totalPages: number = 1;

  spinner = inject(NgxSpinnerService);
  toastr = inject(ToastrService);
  skillsService = inject(SkillsService);

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

}
