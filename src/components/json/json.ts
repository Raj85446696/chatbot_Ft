import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../../environment.js';

@Component({
  selector: 'app-json',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './json.html',
  styleUrl: './json.css',
})
export class Json {
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';

  private API_URL = `${environment.BASE_API_URL}${environment.ENDPOINTS.UPLOAD_JSON}`;

  constructor(private http: HttpClient) {}

  onSubmit(form: NgForm): void {
    if (form.invalid) return;

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = '';

    const payload = {
      type: form.value.type,
      title: form.value.title,
      content: form.value.content,
      department: form.value.department,
      relatedService: form.value.relatedService,
      source: form.value.source || 'UMANG Official',
    };

    this.http.post(this.API_URL, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        form.resetForm();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err?.error?.message || 'Failed to upload JSON. Please try again.';
      },
    });
  }
}
