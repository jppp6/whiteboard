import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { SupabaseService } from './supabase.service';

export const authGuard = () => {
    const router = inject(Router);
    const supabaseService = inject(SupabaseService);

    // Return a promise or observable
    return new Observable<boolean>((observer) => {
        supabaseService
            .authChangesRx()
            .pipe(
                take(1),
                map((session) => {
                    console.log(session);
                    if (session) {
                        return true;
                    } else {
                        router.navigateByUrl('/login');
                        return false;
                    }
                })
            )
            .subscribe((isAuthenticated) => {
                observer.next(isAuthenticated);
                observer.complete();
            });
    });
};
