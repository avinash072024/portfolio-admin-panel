import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as AOS from 'aos';
import { ThemeTogglerComponent } from "../../components/theme-toggler/theme-toggler.component";
import { RouterLink, Router } from '@angular/router';
import { ToastService } from '../../services/toast/toast.service';
import { SessionService } from '../../services/session/session.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, ThemeTogglerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  passwordVisible = false;

  // Hard-coded credentials
  private readonly validEmail = 'admin@example.com';
  private readonly validPassword = 'Admin@123';

  constructor(private fb: FormBuilder, private router: Router, private toast: ToastService, private sessionService: SessionService) { }

  ngOnInit(): void {
    AOS.init();
    this.initForm();
  }

  initForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  // Helper to check validation status
  isInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    debugger;
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.value;

    if (email === this.validEmail && password === this.validPassword) {
      this.sessionService.setUserSession(JSON.stringify(this.loginForm.value));
      this.toast.showSuccess('Login success');
      this.router.navigate(['/home']);
    } else {
      this.toast.showError('Login failed: wrong credentials');
    }
  }
}