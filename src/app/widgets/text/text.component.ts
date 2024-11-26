import {
    Component,
    EventEmitter,
    input,
    model,
    OnInit,
    Output,
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
                <quill-editor
                    theme="snow"
                    [(ngModel)]="text"
                    (onContentChanged)="onTextChange($event)"
                ></quill-editor>
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

            .text-container {
                background: white;
                padding: 16px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
        `,
    ],
})
export class TextWidget implements OnInit {
    metadata = input.required<{ text: string }>();
    @Output() metadataChanged = new EventEmitter<{ text: string }>();

    text = model<string>('');
    private _textChange = new Subject<string>();

    ngOnInit() {
        this.text.set(this.metadata().text);
        this._textChange
            .pipe(debounceTime(2000), distinctUntilChanged())
            .subscribe((text) => {
                this.metadataChanged.emit({
                    text: text,
                });
            });
    }

    onTextChange(e: ContentChange) {
        this._textChange.next(e.html || '');
    }
}
