import { Routes } from '@angular/router';
import { authGuard } from './core/services/auth.guard';
import { WidgetCanvas } from './pages/canvas/canvas.component';
import { Login } from './pages/login/login.component';
import { Selector } from './pages/selector/selector.component';

export const routes: Routes = [
    // {
    // path: 'account',
    // component: Account,
    // canActivate: [authGuard]
    // },
    {
        path: 'login',
        component: Login,
    },
    {
        path: 'whiteboards',
        component: Selector,
        canActivate: [authGuard],
    },
    {
        path: 'whiteboard/:id',
        component: WidgetCanvas,
        canActivate: [authGuard],
    },
    { path: '**', redirectTo: 'whiteboards' },
];
