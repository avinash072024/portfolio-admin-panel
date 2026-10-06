import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, AbstractControl, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { SessionService } from '../../services/session/session.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize, switchMap, throwError } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  currentPasswordForm!: FormGroup;
  otpForm!: FormGroup;
  verificationMethod: 'password' | 'otp' = 'password';
  oldPasswordVisible = false;
  newPasswordVisible = false;
  confirmPasswordVisible = false;
  currentPasswordSubmitting = false;
  otpSending = false;
  otpSubmitting = false;
  otpSent = false;
  currentUser: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private sessionService: SessionService,
    private router: Router,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.sessionService.getUserSession();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.initForm();
  }

  private initForm(): void {
    this.currentPasswordForm = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, {
      validators: this.passwordMatchValidator
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return confirmPassword && newPassword !== confirmPassword ? { mismatch: true } : null;
  }

  isInvalid(controlName: string): boolean {
    const form = this.verificationMethod === 'password' ? this.currentPasswordForm : this.otpForm;
    const control = form.get(controlName);
    const interacted = !!control && (control.dirty || control.touched);
    const mismatch = controlName === 'confirmPassword' && form.hasError('mismatch');
    return interacted && (!!control?.invalid || mismatch);
  }

  setVerificationMethod(method: 'password' | 'otp'): void {
    this.verificationMethod = method;
    this.currentPasswordForm.reset();
    this.otpForm.reset();
  }

  togglePasswordVisibility(field: 'old' | 'new' | 'confirm') {
    if (field === 'old') {
      this.oldPasswordVisible = !this.oldPasswordVisible;
    } else if (field === 'new') {
      this.newPasswordVisible = !this.newPasswordVisible;
    } else if (field === 'confirm') {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
    }
  }

  onSubmitCurrentPassword(): void {
    if (this.currentPasswordSubmitting) {
      return;
    }

    if (!this.currentPasswordForm.valid) {
      this.currentPasswordForm.markAllAsTouched();
      return;
    }

    this.currentPasswordSubmitting = true;
    this.spinner.show();
    this.authService.verifyCurrentPassword({
      email: this.currentUser.email,
      oldPassword: this.currentPasswordForm.value.oldPassword
    }).pipe(
      switchMap((verification) => {
        const verificationToken = verification.data?.verificationToken;
        if (!verification.success || !verificationToken) {
          return throwError(() => new Error(verification.message || 'Could not verify the current password'));
        }

        return this.authService.changePassword({
          email: this.currentUser.email,
          verificationToken,
          newPassword: this.currentPasswordForm.value.newPassword
        });
      }),
      finalize(() => {
        this.currentPasswordSubmitting = false;
        this.spinner.hide();
      })
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success(response.message || 'Password updated successfully');
          this.currentPasswordForm.reset();
        } else {
          this.toastr.error(response.message || 'Password change failed');
        }
      },
      error: (error) => {
        this.toastr.error(error.error?.message || error.message || 'Server error, please try again later');
      }
    });
  }

  sendOtp(): void {
    if (this.otpSending) {
      return;
    }

    this.otpSending = true;
    this.spinner.show();
    this.authService.sendPasswordResetOtp({ email: this.currentUser.email }).pipe(
      finalize(() => {
        this.otpSending = false;
        this.spinner.hide();
      })
    ).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.otpSent = true;
          this.toastr.success(response.message || 'OTP sent to the registered email');
        } else {
          this.toastr.error(response.message || 'Could not send OTP');
        }
      },
      error: (error: any) => {
        // console.error('Password-reset OTP request failed', {
        //   status: error.status,
        //   message: error.error?.message,
        //   serverError: error.error?.error
        // });
        this.toastr.error(error.error?.message || 'Could not send OTP');
      }
    });
  }

  onOtpSubmit(): void {
    if (!this.otpSent) {
      this.toastr.error('Request an OTP before changing your password');
      return;
    }

    if (!this.otpForm.valid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.otpSubmitting = true;
    this.spinner.show();
    this.authService.verifyPasswordResetOtp({
      email: this.currentUser.email,
      otp: this.otpForm.value.otp,
      newPassword: this.otpForm.value.newPassword
    }).pipe(
      finalize(() => {
        this.otpSubmitting = false;
        this.spinner.hide();
      })
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success(response.message || 'Password updated successfully');
          this.otpForm.reset();
          this.otpSent = false;
        } else {
          this.toastr.error(response.message || 'Password change failed');
        }
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Password change failed');
      }
    });
  }
}
