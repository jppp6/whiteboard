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
        <div class="video-wrapper">
            <div class="drag-handle">
                <mat-icon>drag_indicator</mat-icon>
            </div>

            @if (!videoId()) {
            <div class="input-container" (mousedown)="$event.stopPropagation()">
                <mat-form-field appearance="outline" class="video-input">
                    <mat-label>YouTube Video URL or ID</mat-label>
                    <input matInput [(ngModel)]="inputUrl" />

                    @if (inputUrl().trim() !== '') {
                    <button matSuffix mat-icon-button (click)="deleteLink()">
                        <mat-icon>delete</mat-icon>
                    </button>
                    }
                </mat-form-field>
                <button
                    mat-raised-button
                    [disabled]="!inputUrl()"
                    (click)="embedVideo()"
                >
                    Embed Video
                </button>
            </div>

            } @else {
            <div class="video-container">
                <iframe
                    [src]="safeEmbedUrl()"
                    frameborder="0"
                    allow=" encrypted-media; web-share"
                    allowfullscreen
                ></iframe>
                <div class="video-controls">
                    <button
                        mat-raised-button
                        color="warn"
                        (click)="resetVideo()"
                    >
                        Change Video
                    </button>
                </div>
            </div>
            }
        </div>
    `,
    styles: [
        `
            .video-wrapper:hover .drag-handle {
                opacity: 1;
            }

            .video-wrapper {
                background: white;
                padding: 16px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                width: 480px;
                position: relative;
            }

            .input-container {
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding: 16px;
            }

            .video-input {
                width: 100%;
            }

            .video-container {
                aspect-ratio: 16/9;
                width: 100%;
            }

            iframe {
                width: 100%;
                height: 100%;
            }

            .video-controls {
                margin-top: 8px;
                display: flex;
                justify-content: center;
            }
        `,
    ],
})
export class VideoWidget {
    metadata = input.required<{ url: string }>();
    @Output() metadataChanged = new EventEmitter<{ url: string }>();

    safeEmbedUrl = signal<SafeResourceUrl>('');
    inputUrl = signal<string>('');
    videoId = signal<string>('');

    private readonly _sanitizer = inject(DomSanitizer);

    ngOnInit(): void {
        this.inputUrl.set(this.metadata().url);
        this.embedVideo();
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
        });
    }
}
