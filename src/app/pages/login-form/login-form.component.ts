import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ThemeTogglerComponent } from "../../components/theme-toggler/theme-toggler.component";
import { SessionService } from '../../services/session/session.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ThemeTogglerComponent],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent implements OnInit {
  loginForm: FormGroup;
  passwordVisible = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private sessionService: SessionService,
    private router: Router,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    if(this.sessionService.getUserSession()) {
      this.router.navigate(['/home']);
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.spinner.show();
      this.authService.login(this.loginForm.value).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.sessionService.setUserSession(res.data);
            this.spinner.hide();
            this.toastr.success(res.message || 'Login successful');
            this.router.navigate(['/home']);
          } else {
            this.spinner.hide();
            this.toastr.error(res.message || 'Login failed');
          }
        },
        error: (err) => {
          this.spinner.hide();
          this.toastr.error(err.error?.message || 'Server error');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}
