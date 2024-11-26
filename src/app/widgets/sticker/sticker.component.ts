import { CommonModule } from '@angular/common';
import { Component, inject, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
    MatDialog,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'sticker',
    imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
    template: `
        <div class="sticker-wrapper">
            <div class="drag-handle">
                <mat-icon>drag_indicator</mat-icon>
            </div>
            <div
                class="sticker-container"
                (mousedown)="$event.stopPropagation()"
            >
                <div class="edit-button" (click)="openStickerSelector()">
                    <mat-icon>edit</mat-icon>
                </div>
                @if (stickerUrl()) {
                <img
                    [src]="stickerUrl()"
                    alt="Selected sticker"
                    class="sticker-image"
                />
                } @else {
                <div class="empty-sticker">
                    <mat-icon>image</mat-icon>
                </div>
                }
            </div>
        </div>
    `,
    styles: [
        `
            .sticker-container {
                background: white;
                padding: 16px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                width: 200px;
                height: 200px;
            }

            .sticker-wrapper {
                width: 232px;
                height: 232px;
            }

            .sticker-wrapper:hover .edit-button,
            .sticker-wrapper:hover .drag-handle {
                opacity: 1;
            }

            .sticker-image {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }

            .empty-sticker {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f5f5f5;
            }

            .empty-sticker mat-icon {
                font-size: 48px;
                width: 48px;
                height: 48px;
                color: #bdbdbd;
            }
        `,
    ],
})
export class StickerWidget {
    metadata = input.required<{ url: string }>();

    stickerUrl = model<string>('');

    private readonly _dialog = inject(MatDialog);

    openStickerSelector() {
        const dialogRef = this._dialog.open(StickerSelectorDialog, {
            width: '500px',
            panelClass: 'sticker-selector-dialog',
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.stickerUrl.set(result.url);
            }
        });
    }
}
@Component({
    selector: 'sticker-selector-dialog',
    imports: [
        CommonModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
    ],
    template: `
        <div class="dialog-container">
            <h2>Select a Sticker</h2>
            <div class="sticker-grid">
                @for (sticker of stickers(); track sticker.id) {
                <div
                    class="sticker-option"
                    [class.selected]="selectedSticker() === sticker.url"
                    (click)="selectSticker(sticker.url)"
                >
                    <img [src]="sticker.url" [alt]="sticker.name" />
                </div>
                }
            </div>
            <div class="dialog-actions">
                <button mat-button (click)="close()">Cancel</button>
                <button
                    mat-raised-button
                    color="primary"
                    (click)="confirm()"
                    [disabled]="!selectedSticker()"
                >
                    Apply
                </button>
            </div>
        </div>
    `,
    styles: [
        `
            .dialog-container {
                padding: 24px;
                min-width: 400px;
            }

            .sticker-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
                margin: 24px 0;
                max-height: 400px;
                overflow-y: auto;
            }

            .sticker-option {
                aspect-ratio: 1;
                padding: 8px;
                border: 2px solid transparent;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .sticker-option:hover {
                background: rgba(0, 0, 0, 0.04);
            }

            .sticker-option.selected {
                border-color: #1976d2;
                background: rgba(25, 118, 210, 0.04);
            }

            .sticker-option img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            }

            .dialog-actions {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
                margin-top: 16px;
            }
        `,
    ],
})
class StickerSelectorDialog {
    stickers = signal([
        { id: 1, name: 'Sticker 1', url: '/assets/stickers/sticker1.png' },
        { id: 2, name: 'Sticker 2', url: '/assets/stickers/sticker2.png' },
    ]);

    selectedSticker = signal<string>('');

    private dialogRef = inject(MatDialogRef<StickerSelectorDialog>);

    selectSticker(url: string) {
        this.selectedSticker.set(url);
    }

    close() {
        this.dialogRef.close();
    }

    confirm() {
        this.dialogRef.close({ url: this.selectedSticker() });
    }
}
