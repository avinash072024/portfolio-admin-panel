import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ThemeTogglerComponent } from '../../components/theme-toggler/theme-toggler.component';

@Component({
  selector: 'app-forgot-password-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ThemeTogglerComponent],
  templateUrl: './forgot-password-form.component.html',
  styleUrl: './forgot-password-form.component.scss'
})
export class ForgotPasswordFormComponent {
  forgotPasswordForm: FormGroup;
  submitted = false;
  successMessage = false;

  constructor(private fb: FormBuilder) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.forgotPasswordForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    this.submitted = true;
    if (this.forgotPasswordForm.valid) {
      console.log('Reset Password Request for:', this.forgotPasswordForm.value.email);
      // Simulate an API call
      setTimeout(() => {
        this.successMessage = true;
        this.forgotPasswordForm.reset();
      }, 1000);
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }
}
