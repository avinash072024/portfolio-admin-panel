import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { ProjectsService } from '../../services/projects/projects.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-edit-project',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-edit-project.component.html',
  styleUrl: './add-edit-project.component.scss'
})
export class AddEditProjectComponent implements OnInit {
  projectForm!: FormGroup;
  fb = inject(FormBuilder);
  projectService = inject(ProjectsService);
  spinner = inject(NgxSpinnerService);
  toastr = inject(ToastrService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  currentProjectId: string | null = null;
  isEdit: boolean = false;

  ngOnInit(): void {
    this.projectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      date: ['', Validators.required],
      image: [''],
      link: [''],
      desc: this.fb.array([this.fb.control('', Validators.required)]),
      tools: this.fb.array([this.fb.control('', Validators.required)])
    });

    // Check for route param to determine edit mode
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEdit = true;
        this.currentProjectId = id;
        this.spinner.show();
        this.projectService.getProjectById(id).subscribe({
          next: (res: any) => {
            if (res?.success) {
              this.populateForm(res.project || res);
            } else {
              this.toastr.error(res?.message || 'Failed to load project');
            }
            this.spinner.hide();
          },
          error: (err: any) => {
            this.spinner.hide();
            this.toastr.error(err?.message || 'Error loading project');
          }
        })
      }
    })
  }

  private populateForm(project: any) {
    // patch simple fields
    this.projectForm.patchValue({
      title: project.title || '',
      category: project.category || '',
      date: project.date || '',
      image: project.image || '',
      link: project.link || ''
    });

    // populate desc array
    const descArr = this.projectForm.get('desc') as FormArray;
    while (descArr.length) descArr.removeAt(0);
    (project.desc || []).forEach((d: any) => descArr.push(this.fb.control(d, Validators.required)));

    // populate tools array
    const toolsArr = this.projectForm.get('tools') as FormArray;
    while (toolsArr.length) toolsArr.removeAt(0);
    (project.tools || []).forEach((t: any) => toolsArr.push(this.fb.control(t, Validators.required)));
  }

  // Getters for FormArrays
  get descArray() { return this.projectForm.get('desc') as FormArray; }
  get toolsArray() { return this.projectForm.get('tools') as FormArray; }

  // Dynamic Array Methods
  addItem(array: FormArray) { array.push(this.fb.control('', Validators.required)); }
  removeItem(array: FormArray, index: number) { if (array.length > 1) array.removeAt(index); }

  // Validation Helper
  isInvalid(controlName: string | (string | number)[]): boolean {
    const control = this.projectForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.projectForm.valid) {
      // console.log('Project Data:', this.projectForm.value);
      this.spinner.show();
      if (this.isEdit && this.currentProjectId) {
        this.projectService.updateProject(this.currentProjectId, this.projectForm.value).subscribe({
          next: (res: any) => {
            if (res?.success) {
              this.spinner.hide();
              this.toastr.success(res?.message || 'Project updated');
              this.router.navigateByUrl('/projects');
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
      } else {
        this.projectService.addProject(this.projectForm.value).subscribe({
          next: (res: any) => {
            if (res?.success) {
              this.projectForm.reset();
              this.spinner.hide();
              this.toastr.success(res?.message);
              this.router.navigateByUrl('/projects');
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
    } else {
      this.projectForm.markAllAsTouched();
    }
  }
}