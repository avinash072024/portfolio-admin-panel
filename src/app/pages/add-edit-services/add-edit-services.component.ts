import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ServicesService } from '../../services/service/services.service';

@Component({
  selector: 'app-add-edit-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-edit-services.component.html',
  styleUrl: './add-edit-services.component.scss'
})
export class AddEditServicesComponent implements OnInit {
  serviceForm!: FormGroup;
  fb = inject(FormBuilder);
  servicesService = inject(ServicesService);
  spinner = inject(NgxSpinnerService);
  toastr = inject(ToastrService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  currentServiceId: string | null = null;
  isEdit: boolean = false;
  page: number = 1;

  ngOnInit(): void {
    this.page = Number(this.route.snapshot.queryParamMap.get('page')) || 1;
    this.serviceForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      icon: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      features: this.fb.array([this.fb.control('', Validators.required)])
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEdit = true;
        this.currentServiceId = id;
        this.getServiceDetails(id);
      }
    });
  }

  getServiceDetails(id: string) {
    this.spinner.show();
    this.servicesService.getServiceById(id).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.populateForm(res.service || res);
        } else {
          this.toastr.error(res?.message || 'Failed to load service');
        }
        this.spinner.hide();
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err?.message || 'Error loading service');
      }
    });
  }

  private populateForm(service: any) {
    this.serviceForm.patchValue({
      title: service.title || '',
      icon: service.icon || '',
      description: service.description || ''
    });

    const featuresArr = this.featuresArray;
    while (featuresArr.length) featuresArr.removeAt(0);
    (service.features || []).forEach((f: any) => featuresArr.push(this.fb.control(f, Validators.required)));
    
    if (featuresArr.length === 0) {
      featuresArr.push(this.fb.control('', Validators.required));
    }
  }

  get featuresArray() {
    return this.serviceForm.get('features') as FormArray;
  }

  addFeature() {
    this.featuresArray.push(this.fb.control('', Validators.required));
  }

  removeFeature(index: number) {
    if (this.featuresArray.length > 1) {
      this.featuresArray.removeAt(index);
    }
  }

  isInvalid(controlName: string | (string | number)[]): boolean {
    const control = this.serviceForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.serviceForm.valid) {
      this.spinner.show();
      if (this.isEdit && this.currentServiceId) {
        this.servicesService.updateService(this.currentServiceId, this.serviceForm.value).subscribe({
          next: (res: any) => {
            if (res?.success) {
              this.toastr.success(res?.message || 'Service updated successfully');
              this.router.navigate(['/services'], { queryParams: { page: this.page } });
            } else {
              this.toastr.error(res?.message || 'Update failed');
            }
            this.spinner.hide();
          },
          error: (err: any) => {
            this.spinner.hide();
            this.toastr.error(err?.message || 'Error updating service');
          }
        });
      } else {
        this.servicesService.addService(this.serviceForm.value).subscribe({
          next: (res: any) => {
            if (res?.success) {
              this.toastr.success(res?.message || 'Service added successfully');
              this.router.navigate(['/services'], { queryParams: { page: this.page } });
            } else {
              this.toastr.error(res?.message || 'Create failed');
            }
            this.spinner.hide();
          },
          error: (err: any) => {
            this.spinner.hide();
            this.toastr.error(err?.message || 'Error adding service');
          }
        });
      }
    } else {
      this.serviceForm.markAllAsTouched();
    }
  }
}
