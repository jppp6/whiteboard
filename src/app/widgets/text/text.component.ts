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
        <div class="text-wrapper">
            <div class="drag-handle">
                <mat-icon>drag_indicator</mat-icon>
            </div>
            <div class="text-container" (mousedown)="$event.stopPropagation()">
                <div class="edit-button" (click)="toggleToolbar()">
                    <mat-icon>
                        {{ toolbarVisible() ? 'expand_less' : 'expand_more' }}
                    </mat-icon>
                </div>
                <quill-editor
                    class="w100"
                    theme="snow"
                    [class.toolbar-hidden]="!toolbarVisible()"
                    (onContentChanged)="onTextChange($event)"
                    [(ngModel)]="text"
                >
                </quill-editor>
            </div>
        </div>
    `,
    styles: [
        `
            .text-wrapper {
                width: 500px;
            }

            .text-wrapper:hover .drag-handle {
                opacity: 1;
            }

            .text-wrapper:hover .edit-button {
                opacity: 1;
                cursor: pointer;
            }

            .text-container {
                background: white;
                padding: 16px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .toolbar-hidden ::ng-deep .ql-toolbar {
                display: none;
            }
        `,
    ],
})
export class TextWidget implements OnInit {
    metadata = input.required<{ text: string }>();
    @Output() metadataChanged = new EventEmitter<{ text: string }>();

    text = model<string>('');
    toolbarVisible = signal<boolean>(false);
    private _textChange = new Subject<string>();

    ngOnInit(): void {
        this.text.set(this.metadata().text);
        this._textChange
            .pipe(debounceTime(2000), distinctUntilChanged())
            .subscribe((text) => {
                this.metadataChanged.emit({
                    text: text,
                });
            });
    }
    toggleToolbar(): void {
        this.toolbarVisible.update((v) => !v);
    }
    onTextChange(e: ContentChange): void {
        this._textChange.next(e.html || '');
    }
}
