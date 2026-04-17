import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../../environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm!: FormGroup;
  error = '';
  loading = false;
  passwordVisible = false;

  private PROFILE_URL = `${environment.BASE_API_URL}${environment.ENDPOINTS.PROFILE}`;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private http: HttpClient
  ) {
    this.loginForm = this.fb.group({
      Email: ['', [Validators.required, Validators.email]],
      Password: ['', Validators.required]
    });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  submit() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.error = '';

    this.auth.login(this.loginForm.value).subscribe({
      next: (res) => {
        if (res.role !== 'admin' && res.role !== 'super_admin') {
          this.error = 'Access denied. Admin credentials required.';
          this.auth.logout();
          this.loading = false;
          return;
        }
        const token = localStorage.getItem('token');
        this.http.get<any>(this.PROFILE_URL, {
          headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
          next: (profile) => {
            localStorage.setItem('userProfile', JSON.stringify({
              Fullname: profile.Fullname,
              Email: profile.Email,
              Role: profile.Role
            }));
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            this.error = 'Failed to load profile. Please try again.';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.error = err.error?.message || 'Login failed. Please check your credentials.';
        this.loading = false;
      }
    });
  }
}
