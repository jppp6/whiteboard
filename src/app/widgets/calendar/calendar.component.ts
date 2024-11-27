import { Component, model } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'calendar',
    imports: [MatDatepickerModule, MatIconModule],
    providers: [provideNativeDateAdapter()],
    template: `
        <div class="content-wrapper" style="300px">
            <mat-icon class="drag-handle">drag_indicator</mat-icon>
            <div
                class="content-container"
                (mousedown)="$event.stopPropagation()"
            >
                <mat-calendar [(selected)]="selected"></mat-calendar>
            </div>
        </div>
    `,
})
export class CalendarWidget {
    selected = model<Date>(new Date());
}
