import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    input,
    OnInit,
    Output,
    signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'sticker',
    imports: [CommonModule, MatButtonModule, MatIconModule],
    template: `
        <div
            class="sticker-wrapper"
            [ngStyle]="{ width: size() === 's' ? '232px' : ' 332px' }"
        >
            <div class="drag-handle">
                <mat-icon>drag_indicator</mat-icon>
            </div>
            <div
                class="sticker-container"
                (mousedown)="$event.stopPropagation()"
            >
                <div class="edit-button" (click)="fileInput.click()">
                    <mat-icon>edit</mat-icon>
                </div>
                <input
                    type="file"
                    #fileInput
                    (change)="onFileSelected($event)"
                    accept="image/*"
                    style="display: none"
                />
                @if (stickerB64()) {
                <img
                    [src]="stickerB64()"
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
            }

            .sticker-wrapper:hover .edit-button,
            .sticker-wrapper:hover .drag-handle {
                opacity: 1;
            }

            .sticker-image {
                width: 100%;
                object-fit: contain;
            }

            .empty-sticker {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
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
export class StickerWidget implements OnInit {
    metadata = input.required<{ stickerB64: string; size: 's' | 'l' }>();
    @Output() metadataChanged = new EventEmitter<{
        stickerB64: string;
        size: 's' | 'l';
    }>();

    stickerB64 = signal<string>('');
    size = signal<'s' | 'l'>('s');

    ngOnInit(): void {
        this.stickerB64.set(this.metadata().stickerB64);
        this.size.set(this.metadata().size);
    }

    onFileSelected(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];

        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();

            reader.onload = () => {
                this.stickerB64.set(reader.result as string);
                this.emitMetadataChange();
            };

            reader.readAsDataURL(file);
        }
    }

    emitMetadataChange() {
        this.metadataChanged.emit({
            stickerB64: this.stickerB64(),
            size: this.size(),
        });
    }
}
