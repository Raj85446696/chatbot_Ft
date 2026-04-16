import { Routes } from '@angular/router';
import { Chat } from '../components/chat/chat';
import { Home } from '../components/home/home';
import { Json } from '../components/json/json';
import { Pdf } from '../components/pdf/pdf';
import { Login } from '../components/login/login';
import { AuthGuard } from '../guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Chat },
  { path: 'login', component: Login },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('../dashboard/admin-dasboard/admin-dasboard')
        .then(m => m.AdminDasboard),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../components/dashboard/dashboard')
            .then(m => m.Dashboard)
      },
      {
        path: 'listadmin',
        loadComponent: () =>
          import('../components/list-admin/list-admin')
            .then(m => m.ListAdmin)
      },
      {
        path: 'createadmin',
        loadComponent: () =>
          import('../components/create-admin/create-admin')
            .then(m => m.CreateAdmin)
      },
      {
        path: 'upload',
        component: Home,
        children: [
          { path: 'json', component: Json },
          { path: 'pdf', component: Pdf },
          { path: '', redirectTo: 'json', pathMatch: 'full' }
        ]
      }
    ]
  },

  { path: '**', redirectTo: '' }
];
