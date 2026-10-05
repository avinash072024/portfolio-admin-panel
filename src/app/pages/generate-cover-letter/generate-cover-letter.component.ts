import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ResumeService } from '../../services/resume/resume.service';

@Component({
  selector: 'app-generate-cover-letter',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './generate-cover-letter.component.html',
  styleUrl: './generate-cover-letter.component.scss'
})
export class GenerateCoverLetterComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly resumeService = inject(ResumeService);
  private readonly toastr = inject(ToastrService);

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
        const downloadUrl = window.URL.createObjectURL(pdf);
        const link = document.createElement('a');
        const safeCompanyName = companyName.trim().replace(/[^a-z0-9_-]+/gi, '_');

        link.href = downloadUrl;
        link.download = `${safeCompanyName || 'Company'}_Cover_Letter.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 1000);

        this.toastr.success('Cover letter downloaded successfully');
        this.isGenerating.set(false);
      },
      error: () => {
        this.toastr.error('Failed to generate cover letter. Please try again.');
        this.isGenerating.set(false);
      },
    });
  }
}
