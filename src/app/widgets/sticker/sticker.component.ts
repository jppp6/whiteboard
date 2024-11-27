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
            class="content-wrapper"
            [style.width.px]="width()"
            [style.height.px]="height()"
        >
            <mat-icon class="drag-handle">drag_indicator</mat-icon>
            <div
                class="content-container"
                [style.width.px]="width() - 32"
                [style.height.px]="height() - 32"
                (mousedown)="$event.stopPropagation()"
            >
                <mat-icon class="edit-button" (click)="fileInput.click()">
                    upload
                </mat-icon>

                <input
                    type="file"
                    #fileInput
                    (change)="onFileSelected($event)"
                    accept="image/*"
                    style="display: none"
                />
                @if (stickerB64()) {
                <img
                    style="width: 100%; height: 100%; object-fit: contain;"
                    [src]="stickerB64()"
                />
                }

                <div
                    class="resize-handle"
                    (mousedown)="startResize($event)"
                ></div>
            </div>
        </div>
    `,
})
export class StickerWidget implements OnInit {
    metadata = input.required<{
        stickerB64: string;
        width: number;
        height: number;
    }>();
    @Output() metadataChanged = new EventEmitter<{
        stickerB64: string;
        width: number;
        height: number;
    }>();

    stickerB64 = signal<string>('');
    height = signal<number>(132);
    width = signal<number>(132);

    private _resizing = signal<boolean>(false);
    private _startHeight = signal<number>(0);
    private _startWidth = signal<number>(0);
    private _startX = signal<number>(0);
    private _startY = signal<number>(0);

    ngOnInit(): void {
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));

        this.stickerB64.set(this.metadata().stickerB64);
        this.width.set(this.metadata().width);
        this.height.set(this.metadata().height);
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

    startResize(e: MouseEvent): void {
        this._resizing.set(true);
        this._startX.set(e.clientX);
        this._startY.set(e.clientY);
        this._startWidth.set(this.width());
        this._startHeight.set(this.height());
    }

    onMouseMove(e: MouseEvent): void {
        if (!this._resizing()) return;
        this.width.set(
            Math.max(132, this._startWidth() + e.clientX - this._startX())
        );
        this.height.set(
            Math.max(132, this._startHeight() + e.clientY - this._startY())
        );
    }

    onMouseUp(): void {
        this._resizing.set(false);
        this.emitMetadataChange();
    }

    emitMetadataChange() {
        this.metadataChanged.emit({
            stickerB64: this.stickerB64(),
            width: this.width(),
            height: this.height(),
        });
    }
}
