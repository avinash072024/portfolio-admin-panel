import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-projects',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit {
  projectForm!: FormGroup;
  fb = inject(FormBuilder);

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
      console.log('Project Data:', this.projectForm.value);
    } else {
      this.projectForm.markAllAsTouched();
    }
  }
}