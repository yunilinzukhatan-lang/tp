import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { AuthResponse, LoginRequest, UserInfo } from '../../models/auth.model';
import { ApiResponse } from '../../models/api.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly storage = inject(StorageService);

  private userSubject = new BehaviorSubject<UserInfo | null>(
    this.storage.getUser<UserInfo>()
  );

  readonly currentUser$ = this.userSubject.asObservable();

  get isLoggedIn(): boolean {
    return !!this.storage.getAccessToken();
  }

  get currentUser(): UserInfo | null {
    return this.userSubject.value;
  }

  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(
        `${environment.apiUrl}/admin/auth/login`,
        credentials
      )
      .pipe(
        tap((res) => {
          if (res.success && res.data) {
            this.storage.setAccessToken(res.data.access_token);
            this.storage.setRefreshToken(res.data.refresh_token);
            this.storage.setUser(res.data.user);
            this.userSubject.next(res.data.user);
          }
        })
      );
  }

  logout(): void {
    this.storage.clear();
    this.userSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    const refreshToken = this.storage.getRefreshToken();
    return this.http
      .post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/refresh`, {
        refresh_token: refreshToken,
      })
      .pipe(
        tap((res) => {
          if (res.success && res.data) {
            this.storage.setAccessToken(res.data.access_token);
            this.storage.setRefreshToken(res.data.refresh_token);
          }
        })
      );
  }
}
