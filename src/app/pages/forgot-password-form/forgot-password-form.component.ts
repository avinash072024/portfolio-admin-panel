import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ThemeTogglerComponent } from '../../components/theme-toggler/theme-toggler.component';
import { AuthService } from '../../services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-forgot-password-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ThemeTogglerComponent],
  templateUrl: './forgot-password-form.component.html',
  styleUrl: './forgot-password-form.component.scss'
})
export class ForgotPasswordFormComponent {
  identifyForm: FormGroup;
  otpForm: FormGroup;
  resetForm: FormGroup;
  step: 1 | 2 | 3 = 1;
  sendingOtp = false;
  resettingPassword = false;
  otpSent = false;
  successMessage = false;
  newPasswordVisible = false;
  confirmPasswordVisible = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {
    this.identifyForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return confirmPassword && newPassword !== confirmPassword ? { mismatch: true } : null;
  }

  isInvalid(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    const interacted = !!control && (control.dirty || control.touched);
    const mismatch = controlName === 'confirmPassword' && form.hasError('mismatch');
    return interacted && (!!control?.invalid || mismatch);
  }

  sendOtp(): void {
    if (this.sendingOtp) {
      return;
    }

    if (this.identifyForm.invalid) {
      this.identifyForm.markAllAsTouched();
      return;
    }

    this.sendingOtp = true;
    this.spinner.show();
    this.authService.sendPasswordResetOtp({
      email: this.identifyForm.value.email.trim()
    }).pipe(
      finalize(() => {
        this.sendingOtp = false;
        this.spinner.hide();
      })
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.otpSent = true;
          this.step = 2;
          this.toastr.success(response.message || 'OTP sent to your registered email');
        } else {
          this.toastr.error(response.message || 'Could not send OTP');
        }
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Could not send OTP');
      }
    });
  }

  continueToReset(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.step = 3;
  }

  returnToOtp(): void {
    this.step = 2;
  }

  togglePasswordVisibility(field: 'new' | 'confirm'): void {
    if (field === 'new') {
      this.newPasswordVisible = !this.newPasswordVisible;
    } else {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
    }
  }

  resetPassword(): void {
    if (!this.otpSent || this.resettingPassword) {
      return;
    }

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.resettingPassword = true;
    this.spinner.show();
    this.authService.verifyPasswordResetOtp({
      email: this.identifyForm.value.email.trim(),
      otp: this.otpForm.value.otp,
      newPassword: this.resetForm.value.newPassword
    }).pipe(
      finalize(() => {
        this.resettingPassword = false;
        this.spinner.hide();
      })
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = true;
          this.otpSent = false;
          this.resetForm.reset();
          this.otpForm.reset();
          this.toastr.success(response.message || 'Password reset successfully');
        } else {
          this.toastr.error(response.message || 'Could not reset password');
        }
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'OTP verification or password reset failed');
      }
    });
  }

  resendOtp(): void {
    this.sendOtp();
  }

  isEmailInvalid(controlName: string): boolean {
    const control = this.identifyForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
