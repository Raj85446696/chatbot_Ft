import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../../environment.js';

@Component({
  selector: 'app-pdf',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './pdf.html',
  styleUrl: './pdf.css',
})
export class Pdf {
  isDragOver = false;
  isUploading = false;
  uploadProgress = 0;
  uploadSuccess = false;
  uploadError = '';
  selectedFile: File | null = null;
  private API_URL = `${environment.BASE_API_URL}${environment.ENDPOINTS.UPLOAD_PDF}`;

  constructor(private http: HttpClient) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.processFile(file);
  }

  private processFile(file: File) {
    if (file.type !== 'application/pdf') {
      this.uploadError = 'Please select a valid PDF file.';
      return;
    }
    this.selectedFile = file;
    this.uploadError = '';
    this.uploadSuccess = false;
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  removeFile() {
    this.selectedFile = null;
    this.uploadSuccess = false;
    this.uploadError = '';
    this.uploadProgress = 0;
  }

  onSubmit() {
    if (!this.selectedFile) return;
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    this.isUploading = true;
    this.uploadProgress = 10;
    this.uploadError = '';
    this.uploadSuccess = false;

    // Simulate progress while uploading
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 85) this.uploadProgress += 8;
    }, 200);

    this.http.post(this.API_URL, formData).subscribe({
      next: () => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        setTimeout(() => {
          this.isUploading = false;
          this.uploadSuccess = true;
          this.selectedFile = null;
          this.uploadProgress = 0;
        }, 400);
      },
      error: (err) => {
        clearInterval(progressInterval);
        this.isUploading = false;
        this.uploadProgress = 0;
        this.uploadError = err?.error?.message || 'Upload failed. Please try again.';
      }
    });
  }
}
