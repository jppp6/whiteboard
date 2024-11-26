import { CommonModule } from '@angular/common';
import { Component, inject, model, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
    selector: 'edit-dialog',
    imports: [
        MatButtonModule,
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

        <mat-dialog-actions align="start">
            <button mat-button (click)="deleteWhiteboard()">
                {{ deleteConfirmation() ? 'Delete' : 'Are you sure?' }}
            </button>
            <span class="flex"></span>
            <button mat-button mat-dialog-close>Cancel</button>
            <button mat-stroked-button (click)="confirm()" [disabled]="!name()">
                Update
            </button>
        </mat-dialog-actions>
    `,
    styles: [``],
})
export class EditComponent implements OnInit {
    private readonly _dialogRef = inject(MatDialogRef<EditComponent>);
    private readonly _data = inject<{ name: string; notes: string }>(
        MAT_DIALOG_DATA
    );

    name = model<string>('');
    notes = model<string>('');
    deleteConfirmation = signal<boolean>(true);

    ngOnInit(): void {
        this.name.set(this._data.name);
        this.notes.set(this._data.notes);
    }

    deleteWhiteboard(): void {
        if (this.deleteConfirmation()) {
            this.deleteConfirmation.update((val) => !val);
            return;
        }
        this._dialogRef.close({ delete: true });
    }

    close(): void {
        this._dialogRef.close();
    }

    confirm(): void {
        if (
            this.name() !== this._data.name ||
            this.notes() !== this._data.notes
        ) {
            this._dialogRef.close({ name: this.name(), notes: this.notes() });
        } else {
            this.close();
        }
    }
}
