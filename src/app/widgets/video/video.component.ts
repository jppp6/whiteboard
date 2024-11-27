import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    inject,
    input,
    Output,
    signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'video-player',
    imports: [
        CommonModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        FormsModule,
        MatIconModule,
    ],
    template: `
        <div
            class="content-wrapper"
            [style.width.px]="width()"
            [style.height.px]="height()"
        >
            <mat-icon class="drag-handle"> drag_indicator </mat-icon>

            <div
                class="content-container"
                [style.width.px]="width() - 32"
                [style.height.px]="height() - 32"
                (mousedown)="$event.stopPropagation()"
            >
                @if (!videoId()) {
                <mat-form-field
                    class="w100"
                    appearance="outline"
                    subscriptSizing="dynamic"
                >
                    <mat-label>YouTube Video URL</mat-label>
                    <input matInput [(ngModel)]="inputUrl" />

                    @if (inputUrl().trim() !== '') {
                    <button matSuffix mat-icon-button (click)="deleteLink()">
                        <mat-icon>delete</mat-icon>
                    </button>
                    }
                </mat-form-field>

                <div class="flex-centered">
                    <button
                        mat-raised-button
                        [disabled]="!inputUrl()"
                        (click)="embedVideo()"
                    >
                        Embed Video
                    </button>
                </div>

                } @else {
                <mat-icon class="edit-button" (click)="resetVideo()">
                    chevron_left
                </mat-icon>

                <iframe
                    class="w100 h100"
                    [src]="safeEmbedUrl()"
                    frameborder="0"
                    allow="encrypted-media"
                    allowfullscreen
                ></iframe>
                }

                <div
                    class="resize-handle"
                    (mousedown)="$event.stopPropagation(); startResize($event)"
                ></div>
            </div>
        </div>
    `,
})
export class VideoWidget {
    metadata = input.required<{ url: string; width: number; height: number }>();
    @Output() metadataChanged = new EventEmitter<{
        url: string;
        width: number;
        height: number;
    }>();

    private readonly _sanitizer = inject(DomSanitizer);

    safeEmbedUrl = signal<SafeResourceUrl>('');
    inputUrl = signal<string>('');
    videoId = signal<string>('');

    height = signal<number>(300);
    width = signal<number>(500);

    private _resizing = signal<boolean>(false);
    private _startHeight = signal<number>(0);
    private _startWidth = signal<number>(0);
    private _startX = signal<number>(0);
    private _startY = signal<number>(0);

    ngOnInit(): void {
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));

        this.inputUrl.set(this.metadata().url);
        this.height.set(this.metadata().height);
        this.width.set(this.metadata().width);

        this.embedVideo();
    }

    startResize(e: MouseEvent): void {
        this._resizing.set(true);
        this._startX.set(e.clientX);
        this._startY.set(e.clientY);
        this._startWidth.set(this.width());
        this._startHeight.set(this.height());
    }

    private onMouseMove(e: MouseEvent): void {
        if (!this._resizing()) return;
        this.width.set(
            Math.max(200, this._startWidth() + e.clientX - this._startX())
        );
        this.height.set(
            Math.max(128, this._startHeight() + e.clientY - this._startY())
        );
    }

    private onMouseUp(): void {
        this._resizing.set(false);
        this.emitMetadataChange();
    }

    embedVideo(): void {
        const extractedId = this._extractVideoId(this.inputUrl());
        if (extractedId) {
            this.emitMetadataChange();
            this.videoId.set(extractedId);
            const embedUrl = `https://www.youtube.com/embed/${extractedId}`;
            this.safeEmbedUrl.set(
                this._sanitizer.bypassSecurityTrustResourceUrl(embedUrl)
            );
        }
    }

    deleteLink(): void {
        this.inputUrl.set('');
        this.emitMetadataChange();
    }

    resetVideo(): void {
        this.videoId.set('');
        this.safeEmbedUrl.set('');
    }

    private _extractVideoId(url: string): string | null {
        let videoId: string | null = null;

        const urlMatch = url.match(
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        );

        if (urlMatch) {
            videoId = urlMatch[1];
        } else if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
            videoId = url;
        }

        return videoId;
    }

    emitMetadataChange(): void {
        this.metadataChanged.emit({
            url: this.inputUrl(),
            height: this.height(),
            width: this.width(),
        });
    }
}
