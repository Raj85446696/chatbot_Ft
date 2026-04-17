import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../../environment';

interface Admin {
  _id: string;
  Fullname: string;
  Email: string;
  Role: string;
  CreatedAt: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-list-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './list-admin.html',
  styleUrls: ['./list-admin.css']
})
export class ListAdmin implements OnInit, OnDestroy {

  admins: Admin[] = [];
  filteredAdmins: Admin[] = [];

  isLoading = true;
  isDeleting = false;
  isSkeletonLoading = true;

  errorMessage = '';
  successMessage = '';

  showDeleteModal = false;
  adminToDelete: Admin | null = null;
  deleteConfirmation = '';

  // Search & Filter
  searchTerm = '';
  roleFilter = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  private apiUrl = `${environment.BASE_API_URL}${environment.ENDPOINTS.ADMIN_BASE}`;
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient, private router: Router) {}

  // ==============================
  // Lifecycle
  // ==============================
  ngOnInit(): void {
    this.fetchAdmins();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==============================
  // API
  // ==============================
  fetchAdmins(): void {
    this.isLoading = true;
    this.isSkeletonLoading = true;
    this.clearMessages();

    this.http.get<Admin[]>(`${this.apiUrl}/list`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.admins = data ?? [];
          this.applyFilters();
          this.isLoading = false;
          this.isSkeletonLoading = false;
        },
        error: (error) => {
          console.error('Error fetching admins:', error);
          this.errorMessage =
            error?.error?.message || 'Failed to load admin list.';
          this.isLoading = false;
          this.isSkeletonLoading = false;
        }
      });
  }

  // ==============================
  // Pagination Helpers (NO Math in HTML)
  // ==============================
  getPaginationRange(): string {
    if (this.filteredAdmins.length === 0) return '0 of 0';

    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end =
      this.currentPage * this.pageSize > this.filteredAdmins.length
        ? this.filteredAdmins.length
        : this.currentPage * this.pageSize;

    return `${start} to ${end} of ${this.filteredAdmins.length}`;
  }

  get paginatedAdmins(): Admin[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredAdmins.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  // ==============================
  // Search & Filters
  // ==============================
  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.admins];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(admin =>
        admin.Fullname.toLowerCase().includes(term) ||
        admin.Email.toLowerCase().includes(term) ||
        admin.Role.toLowerCase().includes(term)
      );
    }

    if (this.roleFilter) {
      result = result.filter(admin => admin.Role === this.roleFilter);
    }

    this.filteredAdmins = result;
    this.totalPages = Math.max(
      1,
      Math.ceil(this.filteredAdmins.length / this.pageSize)
    );

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  // ==============================
  // Pagination Controls
  // ==============================
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;

    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(this.totalPages, start + maxPages - 1);

    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // ==============================
  // Actions
  // ==============================
  addAdmin(): void {
    this.router.navigate(['/dashboard/createadmin']);
  }

  editAdmin(admin: Admin): void {
    console.log('Edit admin:', admin);
  }

  viewAdmin(admin: Admin): void {
    console.log('View admin:', admin);
  }

  // ==============================
  // Delete
  // ==============================
  initiateDelete(admin: Admin): void {
    if (admin._id === 'current-user-id') {
      this.errorMessage = 'You cannot delete your own account.';
      return;
    }

    this.adminToDelete = admin;
    this.showDeleteModal = true;
    this.deleteConfirmation = '';
  }

  onDeleteConfirmationChange(value: string): void {
    this.deleteConfirmation = value.toUpperCase();
  }

  confirmDelete(): void {
    if (!this.adminToDelete || this.deleteConfirmation !== 'DELETE') return;

    this.isDeleting = true;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.delete(
      `${this.apiUrl}/delete/${this.adminToDelete._id}`,
      { headers }
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage =
            `Admin "${this.adminToDelete?.Fullname}" deleted successfully`;

          this.admins = this.admins.filter(
            a => a._id !== this.adminToDelete?._id
          );

          this.applyFilters();
          this.resetDeleteState();
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.errorMessage =
            error?.error?.message || 'Failed to delete admin.';
          this.resetDeleteState();
        }
      });
  }

  cancelDelete(): void {
    this.resetDeleteState();
  }

  private resetDeleteState(): void {
    this.isDeleting = false;
    this.showDeleteModal = false;
    this.adminToDelete = null;
    this.deleteConfirmation = '';
  }

  // ==============================
  // Utils
  // ==============================
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  trackById(index: number, admin: Admin): string {
    return admin._id;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getRoleClass(role: string): string {
    const map: Record<string, string> = {
      'Super Admin': 'role-super-admin',
      'Admin': 'role-admin',
      'Moderator': 'role-moderator',
      'Editor': 'role-editor'
    };
    return map[role] || 'role-default';
  }
}
