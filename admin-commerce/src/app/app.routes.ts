import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent
      ),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/product-list/product-list.component').then(
            (m) => m.ProductListComponent
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/categories/category-list/category-list.component').then(
            (m) => m.CategoryListComponent
          ),
      },
      {
        path: 'banners',
        loadComponent: () =>
          import('./features/banners/banner-list/banner-list.component').then(
            (m) => m.BannerListComponent
          ),
      },
      {
        path: 'promos',
        loadComponent: () =>
          import('./features/promos/promo-list/promo-list.component').then(
            (m) => m.PromoListComponent
          ),
      },
      {
        path: 'orders',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/orders/order-list/order-list.component').then(
                (m) => m.OrderListComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/orders/order-detail/order-detail.component').then(
                (m) => m.OrderDetailComponent
              ),
          },
        ],
      },
      {
        path: 'customers',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/customers/customer-list/customer-list.component').then(
                (m) => m.CustomerListComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/customers/customer-detail/customer-detail.component').then(
                (m) => m.CustomerDetailComponent
              ),
          },
        ],
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports.component').then(
            (m) => m.ReportsComponent
          ),
      },
      {
        path: 'points',
        loadComponent: () =>
          import('./features/points/points.component').then(
            (m) => m.PointsComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
