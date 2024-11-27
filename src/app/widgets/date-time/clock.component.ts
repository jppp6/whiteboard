import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'clock',
    imports: [DatePipe, MatIconModule],
    template: `
        <div class="content-wrapper" style="width: 208px">
            <mat-icon class="drag-handle"> drag_indicator </mat-icon>
            <div
                class="content-container"
                (mousedown)="$event.stopPropagation()"
            >
                <div class="date-time-display">
                    {{ time() | date : 'hh:mm:ss' }}
                </div>
            </div>
        </div>
    `,
})
export class ClockWidget implements OnInit, OnDestroy {
    time = signal<Date>(new Date());
    private _intervalId: NodeJS.Timeout | null = null;

    ngOnInit(): void {
        this._intervalId = setInterval(() => {
            this.time.set(new Date());
        }, 1000);
    }

    ngOnDestroy(): void {
        if (this._intervalId) {
            clearInterval(this._intervalId);
        }
    }
}
