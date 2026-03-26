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

  contactForm: FormGroup;
  isLoading = signal(false);
  isSaving = signal(false);
  message = signal<{ type: 'success' | 'error', text: string } | null>(null);

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
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
    this.isLoading.set(true);
    this.contactService.getContact().subscribe({
      next: (res) => {
        if (res.success && res.contact) {
          this.contactForm.patchValue(res.contact);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading contact:', err);
        this.isLoading.set(false);
      }
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isSaving.set(true);
      this.message.set(null);

      this.contactService.updateContact(this.contactForm.value).subscribe({
        next: (res) => {
          if (res.success) {
            this.message.set({ type: 'success', text: res.message });
            setTimeout(() => this.message.set(null), 3000);
          }
          this.isSaving.set(false);
        },
        error: (err) => {
          this.message.set({ type: 'error', text: err.error.message || 'Failed to update contact details' });
          this.isSaving.set(false);
        }
      });
    } else {
      this.contactForm.markAllAsTouched();
    }


  }
}
