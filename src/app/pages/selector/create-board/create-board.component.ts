import { CommonModule } from '@angular/common';
import { Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
    selector: 'create-whiteboard-dialog',
    imports: [
        MatButtonModule,
        MatOptionModule,
        FormsModule,
        CommonModule,
        MatSelectModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
    ],
    template: `
        <mat-dialog-content class="dialog-container">
            <mat-form-field class="w100" appearance="outline">
                <mat-label>Whiteboard Name</mat-label>
                <input matInput type="text" [(ngModel)]="name" />
            </mat-form-field>
            <br />
            <mat-form-field
                class="w100"
                appearance="outline"
                subscriptSizing="dynamic"
            >
                <mat-label>Notes</mat-label>
                <input matInput type="text" [(ngModel)]="notes" />
            </mat-form-field>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
            <button mat-button mat-dialog-close>Cancel</button>
            <button
                mat-button
                (click)="confirm()"
                cdkFocusInitial
                [disabled]="!name()"
            >
                Create
            </button>
        </mat-dialog-actions>
    `,
})
export class CreateWhiteBoardDialog {
    private readonly _dialogRef = inject(MatDialogRef<CreateWhiteBoardDialog>);

    name = model<string>('');
    notes = model<string>('');

    confirm() {
        this._dialogRef.close({ name: this.name(), notes: this.notes() });
    }
}
