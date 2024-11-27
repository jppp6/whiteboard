import {
    Component,
    EventEmitter,
    input,
    model,
    OnInit,
    Output,
    signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ContentChange, QuillModule } from 'ngx-quill';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
    selector: 'text',
    imports: [FormsModule, MatIconModule, QuillModule],
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
                <mat-icon class="edit-button" (click)="toggleToolbar()">
                    {{ toolbarVisible() ? 'expand_less' : 'expand_more' }}
                </mat-icon>

                <quill-editor
                    class="w100"
                    [class.toolbar-hidden]="!toolbarVisible()"
                    (onContentChanged)="onTextChange($event)"
                    [(ngModel)]="text"
                />

                <div
                    class="resize-handle"
                    (mousedown)="startResize($event)"
                ></div>
            </div>
        </div>
    `,
    styles: [
        `
            .toolbar-hidden ::ng-deep .ql-toolbar {
                display: none;
            }
        `,
    ],
})
export class TextWidget implements OnInit {
    metadata = input.required<{
        text: string;
        width: number;
        height: number;
    }>();
    @Output() metadataChanged = new EventEmitter<{
        text: string;
        width: number;
        height: number;
    }>();

    toolbarVisible = signal<boolean>(false);

    height = signal<number>(300);
    width = signal<number>(500);
    text = model<string>('');

    private _textChange = new Subject<string>();
    private _resizing = signal<boolean>(false);
    private _startHeight = signal<number>(0);
    private _startWidth = signal<number>(0);
    private _startX = signal<number>(0);
    private _startY = signal<number>(0);

    ngOnInit(): void {
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));

        this.text.set(this.metadata().text);
        this.height.set(this.metadata().height);
        this.width.set(this.metadata().width);

        this._textChange
            .pipe(debounceTime(2000), distinctUntilChanged())
            .subscribe((text) => {
                this.text.set(text);
                this.emitMetadataChange();
            });
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
            Math.max(76, this._startHeight() + e.clientY - this._startY())
        );
    }

    private onMouseUp(): void {
        this._resizing.set(false);
        this.emitMetadataChange();
    }

    toggleToolbar(): void {
        this.toolbarVisible.update((v) => !v);
    }

    onTextChange(e: ContentChange): void {
        this._textChange.next(e.html || '');
    }

    emitMetadataChange(): void {
        this.metadataChanged.emit({
            text: this.text(),
            height: this.height(),
            width: this.width(),
        });
    }
}
