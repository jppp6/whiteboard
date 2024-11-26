import { CommonModule } from '@angular/common';
import { Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'edit-chart-dialog',
    imports: [
        MatButtonModule,
        FormsModule,
        CommonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
    ],
    template: `
        <mat-dialog-content>
            <mat-form-field
                class="w100"
                appearance="outline"
                subscriptSizing="dynamic"
            >
                <mat-label>Dimension</mat-label>
                <input
                    matInput
                    type="number"
                    max="20"
                    [(ngModel)]="dimension"
                />
            </mat-form-field>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
            <button mat-button mat-dialog-close>Cancel</button>
            <button
                mat-stroked-button
                (click)="confirm()"
                [disabled]="!dimension() || dimension() > 20"
            >
                Update
            </button>
        </mat-dialog-actions>
    `,
})
export class EditChartDialog {
    private readonly _dialogRef = inject(MatDialogRef<EditChartDialog>);
    private readonly _data = inject<{ dimension: number }>(MAT_DIALOG_DATA);

    dimension = model<number>(10);

    ngOnInit() {
        this.dimension.set(this._data.dimension);
    }

    close() {
        this._dialogRef.close();
    }

    confirm() {
        this._dialogRef.close({
            dimension: this.dimension(),
        });
    }
}
