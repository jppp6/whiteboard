import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

export const authGuard = (): boolean => {
    const router = inject(Router);
    const supabaseService = inject(SupabaseService);

    if (supabaseService.session()) {
        return true;
    } else {
        router.navigateByUrl('/login');
        return false;
    }
};
