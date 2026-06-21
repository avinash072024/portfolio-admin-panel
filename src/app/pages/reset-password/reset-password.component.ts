import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { SessionService } from '../../services/session/session.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  oldPasswordVisible = false;
  newPasswordVisible = false;
  confirmPasswordVisible = false;
  currentUser: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private sessionService: SessionService,
    private router: Router,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.sessionService.getUserSession();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.initForm();
  }

  private initForm(): void {
    this.resetForm = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(g: FormGroup) {
    const newPwd = g.get('newPassword');
    const confirmPwd = g.get('confirmPassword');
    if (newPwd && confirmPwd) {
      if (newPwd.value !== confirmPwd.value) {
        confirmPwd.setErrors({ mismatch: true });
      } else {
        const errors = confirmPwd.errors;
        if (errors) {
          delete errors['mismatch'];
          confirmPwd.setErrors(Object.keys(errors).length ? errors : null);
        } else {
          confirmPwd.setErrors(null);
        }
      }
    }
    return null;
  }

  isInvalid(controlName: string): boolean {
    const control = this.resetForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
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

  onSubmit() {
    if (this.resetForm.valid) {
      this.spinner.show();
      const payload = {
        email: this.currentUser.email,
        oldPassword: this.resetForm.value.oldPassword,
        newPassword: this.resetForm.value.newPassword
      };

      this.authService.resetPassword(payload).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          if (res.success) {
            this.toastr.success(res.message || 'Password changed successfully');
            this.resetForm.reset();
          } else {
            this.toastr.error(res.message || 'Password change failed');
          }
        },
        error: (err) => {
          this.spinner.hide();
          this.toastr.error(err.error?.message || 'Server error, please try again later');
        }
      });
    } else {
      this.resetForm.markAllAsTouched();
    }
  }
}
