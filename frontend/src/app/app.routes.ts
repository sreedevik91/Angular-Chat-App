import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent:()=>import('../app/components/login/login.component')
    },
    // {
    //     path: 'chat',
    //     loadComponent:()=>import('../app/components/layout/layout.component'),
    //     canActivate:[authGuard]
    // },
    {
        path:'',
        loadChildren:()=>import('../app/model/childRoutes')
    }
];
