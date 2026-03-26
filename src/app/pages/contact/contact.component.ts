import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactService, ContactInfo } from '../../services/contact/contact.service';
import { CommonModule } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
  private fb = inject(FormBuilder);
  private contactService = inject(ContactService);
  private spinner = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);

  editableFields: boolean = false;

  contactForm: FormGroup;

  constructor() {
    this.contactForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      linkedin: [''],
      github: [''],
      twitter: [''],
      instagram: [''],
      facebook: [''],
      whatsapp: [''],
      resumeUrl: ['']
    });
  }

  ngOnInit(): void {
    this.loadContact();
  }

  loadContact() {
    // this.isLoading.set(true);
    this.spinner.show()
    this.contactService.getContact().subscribe({
      next: (res) => {
        if (res.success && res.contact) {
          this.contactForm.patchValue(res.contact);
        }
        this.spinner.hide();
        // this.isLoading.set(false);
      },
      error: (err) => {
        // console.error('Error loading contact:', err);
        // this.isLoading.set(false);
        this.spinner.hide();
        this.toastr.error(err.error.message || 'Failed to load contact details');
      }
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.spinner.show();
      this.contactService.updateContact(this.contactForm.value).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.toastr.success(res.message);
          }
          // this.isSaving.set(false);
          this.spinner.hide();
          this.editableFields = !this.editableFields;
        },
        error: (err: any) => {
          this.spinner.hide();
          this.toastr.error(err.error.message || 'Failed to update contact details')
        }
      });
    } else {
      this.contactForm.markAllAsTouched();
    }
  }

  eidtableFiedls(): void{
    this.editableFields = !this.editableFields;
    this.toastr.clear();
    this.toastr.info(this.editableFields ? 'Fields are now editable' : 'Fields are now read-only'); 
  }
}
