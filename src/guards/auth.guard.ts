import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // 🔐 must be logged in
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    // 🔐 must be admin or super admin
    if (role !== 'admin' && role !== 'super_admin') {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
