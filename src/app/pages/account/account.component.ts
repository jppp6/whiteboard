import { Component, inject, OnInit } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
    selector: 'app-account',
    imports: [],
    template: ``,
    styles: ``,
})
export class Account implements OnInit {
    private readonly _supabaseService = inject(SupabaseService);

    ngOnInit(): void {}
}
