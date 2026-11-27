import { CommonModule, Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ResumeService } from '../../services/resume/resume.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { SocketService } from '../../services/socket/socket.service';

@Component({
  selector: 'app-generate-cover-letter',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './generate-cover-letter.component.html',
  styleUrl: './generate-cover-letter.component.scss'
})
export class GenerateCoverLetterComponent {

  private readonly formBuilder = inject(FormBuilder);
  private readonly resumeService = inject(ResumeService);
  private readonly toastr = inject(ToastrService);
  socketService = inject(SocketService);
  location = inject(Location);
  sanitizer = inject(DomSanitizer);
  spinner = inject(NgxSpinnerService);

  dynamicResumeUrl: SafeUrl | null = null;

  myInformation: any = null;

  readonly isGenerating = signal(false);

  readonly coverLetterForm = this.formBuilder.nonNullable.group({
    companyName: ['', [Validators.required, Validators.pattern(/\S/)]],
    subject: ['', [Validators.required, Validators.pattern(/\S/)]],
  });

  generateCoverLetter(): void {
    if (this.coverLetterForm.invalid) {
      this.coverLetterForm.markAllAsTouched();
      return;
    }

    const { companyName, subject } = this.coverLetterForm.getRawValue();
    this.isGenerating.set(true);

    this.resumeService.generateCoverLetter(companyName, subject).subscribe({
      next: (pdf: Blob) => {
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
}
