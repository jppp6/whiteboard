import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'clock',
    imports: [DatePipe, MatIconModule],
    template: ` <div class="clock-wrapper" style="width: 208px;">
        <div class="drag-handle">
            <mat-icon>drag_indicator</mat-icon>
        </div>
        <div class="clock-container" (mousedown)="$event.stopPropagation()">
            <div class="clock-display">
                {{ time() | date : 'hh:mm:ss' }}
            </div>
        </div>
    </div>`,
    styles: `
    .clock-container {
        background: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .clock-wrapper:hover .drag-handle {
        opacity: 1;
    }

    .clock-display {
        font-size: 32px;
        font-weight: bold;
        text-align: center;
        font-family: monospace;
    }
`,
})
export class ClockWidget {
    time = signal<Date>(new Date());
    private intervalId: NodeJS.Timeout | null = null;

    ngOnInit() {
        // Update time every second
        this.intervalId = setInterval(() => {
            this.time.set(new Date());
        }, 1000);
    }

    ngOnDestroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
}
