import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as AOS from 'aos';
import { ThemeTogglerComponent } from "../../components/theme-toggler/theme-toggler.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, ThemeTogglerComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    AOS.init();
    this.initForm();
  }

  initForm() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.forgotForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      console.log('Forgot Password:', this.forgotForm.value);
      // Trigger password reset flow (send link)
    } else {
      this.forgotForm.markAllAsTouched();
    }
  }

}
