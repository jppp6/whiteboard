import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'date',
    imports: [DatePipe, MatIconModule],
    template: `
        <div class="content-wrapper" style="width: 275px">
            <mat-icon class="drag-handle"> drag_indicator </mat-icon>
            <div
                class="content-container"
                (mousedown)="$event.stopPropagation()"
            >
                <div class="date-time-display">
                    {{ today() | date }}
                </div>
            </div>
        </div>
    `,
})
export class DateWidget {
    readonly today = signal<Date>(new Date());
}
