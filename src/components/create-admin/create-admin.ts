import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../../environment';

@Component({
  selector: 'app-create-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  templateUrl: './create-admin.html',
  styleUrl: './create-admin.css',
})
export class CreateAdmin {
  adminForm: FormGroup;
  showPassword = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  // Password requirements
  hasMinLength = false;
  hasLetters = false;
  hasNumbers = false;
  passwordStrength = 0;

  private apiUrl = `${environment.BASE_API_URL}${environment.ENDPOINTS.CREATE_ADMIN}`;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
  ) {
    this.adminForm = this.fb.group({
      Fullname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      Email: ['', [Validators.required, Validators.email]],
      Password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-zA-Z])(?=.*\d).+$/),
        ],
      ],
      Role: [{ value: 'Admin', disabled: true }],
    });

    // Listen for password changes to compute strength
    this.adminForm.get('Password')?.valueChanges.subscribe((val: string) => {
      this.computePasswordStrength(val || '');
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // ── Password Strength ──
  private computePasswordStrength(password: string): void {
    this.hasMinLength = password.length >= 8;
    this.hasLetters = /[a-zA-Z]/.test(password);
    this.hasNumbers = /\d/.test(password);

    let strength = 0;
    if (password.length > 0) strength = 1;
    if (this.hasMinLength) strength = 2;
    if (this.hasMinLength && (this.hasLetters || this.hasNumbers)) strength = 3;
    if (this.hasMinLength && this.hasLetters && this.hasNumbers) strength = 4;
    this.passwordStrength = strength;
  }

  getStrengthLabel(): string {
    const labels: Record<number, string> = { 1: 'Weak', 2: 'Fair', 3: 'Good', 4: 'Strong' };
    return labels[this.passwordStrength] || '';
  }

  getStrengthSegClass(): string {
    const classes: Record<number, string> = {
      1: 'seg-weak',
      2: 'seg-fair',
      3: 'seg-good',
      4: 'seg-strong',
    };
    return classes[this.passwordStrength] || '';
  }

  // ── Submit ──
  onSubmit(): void {
    if (this.adminForm.invalid) {
      this.markFormGroupTouched(this.adminForm);
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = {
      ...this.adminForm.getRawValue(),
      CreatedAt: new Date().toISOString(),
    };

    this.http.post(this.apiUrl, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = `Admin "${payload.Fullname}" created successfully.`;
        this.adminForm.reset({ Role: 'Admin' });
        this.passwordStrength = 0;
        this.hasMinLength = false;
        this.hasLetters = false;
        this.hasNumbers = false;
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error?.error?.message || 'Failed to create admin. Please try again.';
      },
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
    });
  }
}
