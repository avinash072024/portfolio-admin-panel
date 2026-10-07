import { CommonModule, Location } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ResumeService } from '../../services/resume/resume.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ContactService } from '../../services/contact/contact.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SocketService } from '../../services/socket/socket.service';
import { Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-generate-cover-letter',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './generate-cover-letter.component.html',
  styleUrl: './generate-cover-letter.component.scss'
})
export class GenerateCoverLetterComponent implements OnInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly resumeService = inject(ResumeService);
  private readonly contactService = inject(ContactService);
  private readonly toastr = inject(ToastrService);
  socketService = inject(SocketService);
  location = inject(Location);
  sanitizer = inject(DomSanitizer);
  spinner = inject(NgxSpinnerService);

  private destroy$ = new Subject<void>();

  dynamicResumeUrl: SafeUrl | null = null;

  myInformation: any = null;

  readonly isGenerating = signal(false);
  readonly coverLetterForm = this.formBuilder.nonNullable.group({
    companyName: ['', [Validators.required, Validators.pattern(/\S/)]],
    subject: ['', [Validators.required, Validators.pattern(/\S/)]],
  });

  ngOnInit(): void {
    this.getContactInfo(true);
    this.subscribeToSocketUpdates();
  }

  getContactInfo(showSpinner: boolean): void {
    if (showSpinner) {
      this.spinner.show();
    }
    this.contactService.getContact().subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.myInformation = res.contact;
          this.spinner.hide();
        } else {
          this.spinner.hide();
          this.toastr.error('Failed to fetch contact details. Please try again.');
        }
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error('Failed to fetch contact details. Please try again.');
      }
    })
  }

  generateCoverLetter(): void {
    if (this.coverLetterForm.invalid) {
      this.coverLetterForm.markAllAsTouched();
      return;
    }

    const { companyName, subject } = this.coverLetterForm.getRawValue();
    this.isGenerating.set(true);

    this.resumeService.generateCoverLetter(companyName, subject).subscribe({
      next: (pdf: Blob) => {
        // const downloadUrl = window.URL.createObjectURL(pdf);
        // const link = document.createElement('a');
        // const safeCompanyName = companyName.trim().replace(/[^a-z0-9_-]+/gi, '_');

        // link.href = downloadUrl;
        // link.download = `${safeCompanyName || 'Company'}_Cover_Letter.pdf`;
        // document.body.appendChild(link);
        // link.click();
        // link.remove();
        // setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 1000);

        // this.toastr.success('Cover letter downloaded successfully');
        // this.isGenerating.set(false);
        const blobUrl = window.URL.createObjectURL(pdf);
        this.dynamicResumeUrl = this.sanitizer.bypassSecurityTrustUrl(blobUrl);

        // const fileName = 'Avinash_Marbhal_Cover_Letter.pdf';
        const fileName = this.myInformation
          ? `${this.myInformation.firstName || 'Avinash'}_${this.myInformation.lastName || 'Marbhal'}_Cover_Letter.pdf`
          : 'Avinash_Marbhal_Cover_Letter.pdf';

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        this.toastr.success('Cover letter downloaded successfully');
        this.coverLetterForm.reset();
        this.isGenerating.set(false);
      },
      error: () => {
        this.toastr.error('Failed to generate cover letter. Please try again.');
        this.isGenerating.set(false);
      },
    });
  }

  private subscribeToSocketUpdates(): void {
    this.socketService
      .onRefreshOrDataUpdated(['contact', 'contacts'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getContactInfo(false);
      });
  }
}
