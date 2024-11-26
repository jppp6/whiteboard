import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'text',
    imports: [MatFormFieldModule, FormsModule, MatInputModule, MatIconModule],
    template: `
        <div class="text-wrapper" style="width: 500px;">
            <div class="drag-handle">
                <mat-icon>drag_indicator</mat-icon>
            </div>
            <div class="text-container" (mousedown)="$event.stopPropagation()">
                <mat-form-field class="h100 w100" subscriptSizing="dynamic">
                    <mat-label>Notes</mat-label>
                    <textarea matInput [(ngModel)]="text"></textarea>
                </mat-form-field>
            </div>
        </div>
    `,
    styles: [
        `
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
export class TextWidget {
    metadata = input.required<{ text: string }>();

    text = model<string>('');
}
