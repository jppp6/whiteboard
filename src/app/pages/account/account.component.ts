import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
    selector: 'app-account',
    imports: [MatButtonModule],
    template: ``,
    styles: ``,
})
export class Account implements OnInit {
    private readonly _supabaseService = inject(SupabaseService);

    ngOnInit(): void {}
}
