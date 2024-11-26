import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'date',
    imports: [DatePipe, MatIconModule],
    template: ` <div class="date-wrapper" style="width: 275px;">
        <div class="drag-handle">
            <mat-icon>drag_indicator</mat-icon>
        </div>
        <div class="date-container" (mousedown)="$event.stopPropagation()">
            <div class="date-display">
                {{ today() | date }}
            </div>
        </div>
    </div>`,
    styles: `
    .date-container {
        background: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .date-wrapper:hover .drag-handle {
        opacity: 1;
    }

    .date-display {
        font-size: 32px;
        font-weight: bold;
        text-align: center;
        font-family: monospace;
    }
`,
})
export class DateWidget {
    today = signal<Date>(new Date());
}
