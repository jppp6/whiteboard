import { CommonModule } from '@angular/common';
import { Component, computed, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
    selector: 'app-login',
    imports: [
        MatButtonModule,
        MatInputModule,
        FormsModule,
        CommonModule,
        MatFormFieldModule,
    ],
    template: ` <div class="login-container">
        <h2>Sign in via magic link with your email below</h2>

        <mat-form-field style="width: 80%" appearance="outline">
            <mat-label>Email</mat-label>
            <input
                matInput
                type="email"
                placeholder="Ex. john.smith@email.ca"
                [(ngModel)]="email"
            />
        </mat-form-field>
        <br />
        <button
            mat-raised-button
            [disabled]="!email() || loading()"
            (click)="onSubmit()"
        >
            {{ loading() ? 'Loading' : 'Send magic link' }}
        </button>
    </div>`,
    styles: [
        `
            .login-container {
                max-width: 825px;
                margin: 0 auto;
                padding-top: 80px;
            }
        `,
    ],
})
export class Login {
    private readonly _supabaseService = inject(SupabaseService);
    private readonly _snackBar = inject(MatSnackBar);

    session = computed(() => this._supabaseService._session());

    loading = signal<boolean>(false);
    email = model<string>('');

    async onSubmit() {
        this.loading.set(true);
        const email = this.email();
        const { error } = await this._supabaseService.signIn(email);
        if (error) {
            this._snackBar.open('Error sending, try again please', 'Dismiss', {
                duration: 1000,
                horizontalPosition: 'right',
            });
        } else {
            this._snackBar.open('Check email for login link', 'Dismiss', {
                duration: 1000,
                horizontalPosition: 'right',
            });
        }
        this.email.set('');
        this.loading.set(false);
    }
}
