import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from '../../core/services/auth.service';
import { LoadingService } from '../../core/services/loading.service';
import { AsyncPipe } from '@angular/common';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', exact: true },
  { label: 'Products', icon: 'inventory_2', route: '/products' },
  { label: 'Categories', icon: 'category', route: '/categories' },
  { label: 'Banners', icon: 'image', route: '/banners' },
  { label: 'Promos', icon: 'local_offer', route: '/promos' },
  { label: 'Orders', icon: 'shopping_cart', route: '/orders' },
  { label: 'Customers', icon: 'people', route: '/customers' },
  { label: 'Reports', icon: 'bar_chart', route: '/reports' },
  { label: 'Loyalty Points', icon: 'stars', route: '/points' },
];

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule,
    AsyncPipe,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <!-- Sidebar -->
      <mat-sidenav
        #sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        class="sidenav"
      >
        <!-- Logo -->
        <div class="sidenav__brand">
          <div class="brand-logo">
            <mat-icon>storefront</mat-icon>
          </div>
          <div class="brand-text">
            <span class="brand-name">Commerce</span>
            <span class="brand-sub">Admin Panel</span>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Navigation -->
        <mat-nav-list class="sidenav__nav">
          @for (item of navItems; track item.route) {
            <a
              mat-list-item
              [routerLink]="item.route"
              routerLinkActive="nav-item--active"
              [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
              class="nav-item"
              (click)="isMobile() && sidenav.close()"
            >
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>

        <!-- Sidebar Footer -->
        <div class="sidenav__footer">
          <mat-divider></mat-divider>
          <div class="sidenav__user">
            <div class="user-avatar">
              {{ userInitial() }}
            </div>
            <div class="user-info">
              <span class="user-email">{{ currentUser()?.email }}</span>
              <span class="user-role">Administrator</span>
            </div>
          </div>
        </div>
      </mat-sidenav>

      <!-- Main Content -->
      <mat-sidenav-content class="main-content">
        <!-- Top Bar -->
        <mat-toolbar class="toolbar" color="primary">
          <button
            mat-icon-button
            (click)="sidenav.toggle()"
            aria-label="Toggle menu"
          >
            <mat-icon>menu</mat-icon>
          </button>

          <span class="toolbar__spacer"></span>

          <!-- Loading indicator -->
          @if (loading$ | async) {
            <div class="loading-bar"></div>
          }

          <!-- User menu -->
          <button mat-icon-button [matMenuTriggerFor]="userMenu" class="toolbar__user-btn">
            <div class="toolbar__avatar">{{ userInitial() }}</div>
          </button>

          <mat-menu #userMenu="matMenu" xPosition="before">
            <div class="user-menu-header">
              <strong>{{ currentUser()?.email }}</strong>
              <small>Administrator</small>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Sign Out</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <!-- Global loading bar -->
        @if (loading$ | async) {
          <div class="progress-bar-container">
            <div class="progress-bar-indeterminate"></div>
          </div>
        }

        <!-- Page Content -->
        <div class="page-wrapper">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }

    .sidenav-container {
      height: 100%;
    }

    .sidenav {
      width: 256px;
      background: #1a1a2e;
      color: #fff;
      display: flex;
      flex-direction: column;
    }

    .sidenav__brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 16px;
    }

    .brand-logo {
      width: 40px;
      height: 40px;
      background: #B8262F;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      mat-icon { color: #fff; font-size: 22px; }
    }

    .brand-name {
      display: block;
      font-size: 16px;
      font-weight: 700;
      color: #fff;
    }

    .brand-sub {
      display: block;
      font-size: 11px;
      color: #fff;
    }

    .sidenav__nav {
      flex: 1;
      padding: 8px 0;
      overflow-y: auto;
    }

    .nav-item {
      margin: 2px 8px;
      border-radius: 8px !important;
      color: #fff !important;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255,255,255,0.08) !important;
        color: #fff !important;
      }

      mat-icon { color: inherit !important; }
    }

    ::ng-deep .nav-item--active {
      background: #B8262F !important;
      color: #fff !important;
    }

    ::ng-deep .sidenav {
      .mdc-list-item__primary-text,
      .mdc-list-item__secondary-text,
      .mat-mdc-list-item-title,
      .mat-mdc-list-item-line {
        color: #fff !important;
      }
    }

    .sidenav__footer {
      margin-top: auto;
    }

    .sidenav__user {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px;
    }

    .user-avatar, .toolbar__avatar {
      width: 36px;
      height: 36px;
      background: #B8262F;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }

    .user-email {
      display: block;
      font-size: 13px;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 160px;
    }

    .user-role {
      display: block;
      font-size: 11px;
      color: #fff;
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #fff !important;
      color: #1a1a2e !important;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }

    .toolbar__spacer { flex: 1; }

    .toolbar__user-btn {
      margin-left: 8px;
    }

    .user-menu-header {
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      strong { font-size: 13px; }
      small { font-size: 11px; color: #999; }
    }

    .progress-bar-container {
      height: 3px;
      overflow: hidden;
      background: #fce4e5;
    }

    .progress-bar-indeterminate {
      height: 100%;
      background: #B8262F;
      width: 40%;
      animation: progress 1.5s ease-in-out infinite;
      transform-origin: left;
    }

    @keyframes progress {
      0% { transform: translateX(-100%) scaleX(1); }
      50% { transform: translateX(60%) scaleX(1.5); }
      100% { transform: translateX(250%) scaleX(1); }
    }

    .main-content {
      background: #f5f6fa;
      display: flex;
      flex-direction: column;
    }

    .page-wrapper {
      flex: 1;
      padding: 24px;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
      box-sizing: border-box;
    }

    @media (max-width: 768px) {
      .page-wrapper { padding: 16px; }
    }
  `],
})
export class AdminLayoutComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly loadingService = inject(LoadingService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly navItems = NAV_ITEMS;
  readonly loading$ = this.loadingService.loading$;
  readonly isMobile = signal(false);
  readonly currentUser = signal(this.authService.currentUser);
  readonly userInitial = signal('A');

  ngOnInit(): void {
    this.breakpointObserver.observe([Breakpoints.HandsetPortrait]).subscribe((result) => {
      this.isMobile.set(result.matches);
    });

    this.authService.currentUser$.subscribe((user) => {
      this.currentUser.set(user);
      if (user?.email) {
        this.userInitial.set(user.email[0].toUpperCase());
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
