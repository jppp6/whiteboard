import { Component, model } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'calendar',
    imports: [MatDatepickerModule, MatIconModule],
    providers: [provideNativeDateAdapter()],
    template: `
        <div class="calendar-wrapper">
            <div class="drag-handle">
                <mat-icon>drag_indicator</mat-icon>
            </div>
            <div
                class="calendar-container"
                (mousedown)="$event.stopPropagation()"
            >
                <mat-calendar [(selected)]="selected"></mat-calendar>
            </div>
        </div>
    `,
    styles: [
        `
            .calendar-wrapper {
                width: 300px;
            }

            .calendar-wrapper:hover .drag-handle {
                opacity: 1;
            }

            .calendar-container {
                background: white;
                padding: 0px 16px 16px 16px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
        `,
    ],
})
export class CalendarWidget {
    selected = model<Date>(new Date());
}
