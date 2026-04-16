import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private LOGIN_URL =
    `${environment.BASE_API_URL}${environment.ENDPOINTS.LOGIN}`;

  constructor(private http: HttpClient) {}

  login(data: { Email: string; Password: string }) {
    return this.http.post<any>(this.LOGIN_URL, data).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);
      })
    );
  }

  logout() {
    localStorage.clear();
  }
}
