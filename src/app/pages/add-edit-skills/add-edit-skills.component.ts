import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SkillsService } from '../../services/skills/skills.service';

@Component({
  selector: 'app-add-edit-skills',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './add-edit-skills.component.html',
  styleUrl: './add-edit-skills.component.scss'
})
export class AddEditSkillsComponent implements OnInit {
  skillForm!: FormGroup;
  fb = inject(FormBuilder);
  skillsService = inject(SkillsService);
  spinner = inject(NgxSpinnerService);
  toastr = inject(ToastrService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  isEdit: boolean = false;
  currentSkillId: string | null = null;

  ngOnInit(): void {
    this.skillForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      icon: [''],
      level: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
      color: ['#0d6efd'],
      category: ['', Validators.required]
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEdit = true;
        this.currentSkillId = id;
        this.spinner.show();
        this.skillsService.getSkillById(id).subscribe({
          next: (res: any) => {
            if (res?.success) {
              this.populateForm(res.skill || res);
            } else {
              this.toastr.error(res?.message || 'Failed to load skill');
            }
            this.spinner.hide();
          },
          error: (err: any) => {
            this.spinner.hide();
            this.toastr.error(err?.message || 'Error loading skill');
          }
        })
      }
    })
  }

  private populateForm(skill: any) {
    this.skillForm.patchValue({
      name: skill.name || '',
      icon: skill.icon || '',
      level: skill.level ?? 50,
      color: skill.color || '#0d6efd',
      category: skill.category || ''
    });
  }

  isInvalid(controlName: string | (string | number)[]): boolean {
    const control = this.skillForm.get(controlName as any);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.skillForm.valid) {
      this.spinner.show();
      const payload = this.skillForm.value;
      if (this.isEdit && this.currentSkillId) {
        this.skillsService.updateSkill(this.currentSkillId, payload).subscribe({
          next: (res: any) => {
            this.spinner.hide();
            if (res?.success) {
              this.toastr.success(res?.message || 'Skill updated');
              this.router.navigateByUrl('/skills');
            } else {
              this.toastr.error(res?.message);
            }
          },
          error: (err: any) => {
            this.spinner.hide();
            this.toastr.error(err?.message);
          }
        })
      } else {
        this.skillsService.addSkill(payload).subscribe({
          next: (res: any) => {
            this.spinner.hide();
            if (res?.success) {
              this.toastr.success(res?.message || 'Skill added');
              this.skillForm.reset({ level: 50, color: '#0d6efd' });
              this.router.navigateByUrl('/skills');
            } else {
              this.toastr.error(res?.message);
            }
          },
          error: (err: any) => {
            this.spinner.hide();
            this.toastr.error(err?.message);
          }
        })
      }
    } else {
      this.skillForm.markAllAsTouched();
    }
  }

}
