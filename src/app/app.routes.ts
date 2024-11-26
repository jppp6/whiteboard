import { Routes } from '@angular/router';
import { Account } from './pages/account/account.component';
import { WidgetCanvas } from './pages/canvas/canvas.component';
import { Login } from './pages/login/login.component';
import { Selector } from './pages/selector/selector.component';

export const routes: Routes = [
    {
        path: 'whiteboard/:id',
        component: WidgetCanvas,
        // canActivate: [authGuard],
    },
    {
        path: 'account',
        component: Account,
        // canActivate: [authGuard]
    },
    {
        path: 'login',
        component: Login,
        // canActivate: [authGuard]
    },
    {
        path: 'whiteboards',
        component: Selector,
        // canActivate: [authGuard]
    },
    { path: '**', redirectTo: 'login' },
];
