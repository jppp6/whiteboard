import { CommonModule } from '@angular/common';
import {
    Component,
    computed,
    EventEmitter,
    input,
    OnDestroy,
    OnInit,
    Output,
    signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
    selector: 'countdown',
    imports: [
        CommonModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        FormsModule,
        MatIconModule,
        MatProgressBarModule,
    ],
    template: `
        <div class="timer-wrapper" style="width: 232px;">
            <div class="drag-handle">
                <mat-icon>drag_indicator</mat-icon>
            </div>
            <div class="timer-container" (mousedown)="$event.stopPropagation()">
                @if (isRunning()){
                <div class="timer-display">
                    {{ displayTime() }}
                </div>
                <mat-progress-bar
                    mode="determinate"
                    [value]="progress()"
                ></mat-progress-bar>
                <br />
                } @else {
                <div class="timer-input">
                    <mat-form-field
                        appearance="outline"
                        class="time-input"
                        subscriptSizing="dynamic"
                    >
                        <mat-label>Minutes</mat-label>
                        <input
                            matInput
                            type="number"
                            [(ngModel)]="minutes"
                            min="0"
                            max="999"
                        />
                    </mat-form-field>
                    <mat-form-field
                        appearance="outline"
                        class="time-input"
                        subscriptSizing="dynamic"
                    >
                        <mat-label>Seconds</mat-label>
                        <input
                            matInput
                            type="number"
                            [(ngModel)]="seconds"
                            min="0"
                            max="59"
                        />
                    </mat-form-field>
                </div>
                }

                <div class="timer-controls">
                    <button mat-raised-button (click)="toggleTimer()">
                        {{ isRunning() ? 'Pause' : 'Start' }}
                    </button>
                    <button mat-raised-button (click)="resetTimer()">
                        Reset
                    </button>
                </div>
            </div>
        </div>
    `,
    styles: [
        `
            .timer-container {
                background: white;
                padding: 16px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .timer-wrapper:hover .drag-handle {
                opacity: 1;
            }

            .timer-display {
                font-size: 32px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 8px;
                font-family: monospace;
            }

            .timer-input {
                display: flex;
                gap: 8px;
                padding-bottom: 12px;
            }

            .time-input {
                width: 50%;
            }

            .timer-controls {
                display: flex;
                gap: 8px;
                justify-content: center;
            }
        `,
    ],
})
export class CountdownWidget implements OnInit, OnDestroy {
    metadata = input.required<{ minutes: number; seconds: number }>();
    @Output() metadataChanged = new EventEmitter<{
        minutes: number;
        seconds: number;
    }>();

    isRunning = signal<boolean>(false);
    remainingTime = signal<number>(0);
    minutes = signal<number>(5);
    seconds = signal<number>(0);
    private _timerInterval: NodeJS.Timeout | null = null;

    progress = computed(
        () =>
            100 *
            (1 - this.remainingTime() / (this.minutes() * 60 + this.seconds()))
    );
    displayTime = computed(
        () =>
            `${Math.floor(this.remainingTime() / 60)
                .toString()
                .padStart(2, '0')}:${(this.remainingTime() % 60)
                .toString()
                .padStart(2, '0')}`
    );

    ngOnInit(): void {
        this.minutes.set(this.metadata().minutes);
        this.seconds.set(this.metadata().seconds);
    }

    toggleTimer(): void {
        if (!this.isRunning()) {
            if (this.remainingTime() === 0) {
                this.remainingTime.set(this.minutes() * 60 + this.seconds());
                if (this.remainingTime() === 0) {
                    return;
                }
            }
            this.startTimer();
        } else {
            this.pauseTimer();
        }
    }

    startTimer(): void {
        this.emitMetadataChange();

        this.isRunning.set(true);
        this._timerInterval = setInterval(() => {
            if (this.remainingTime() > 0) {
                this.remainingTime.update((old) => old - 1);
            } else {
                this.pauseTimer();
            }
        }, 1000);
    }

    pauseTimer(): void {
        this.isRunning.set(false);
        if (this._timerInterval) {
            clearInterval(this._timerInterval);
        }
    }

    resetTimer(): void {
        this.pauseTimer();
        this.remainingTime.set(0);
    }

    ngOnDestroy(): void {
        if (this._timerInterval) {
            clearInterval(this._timerInterval);
        }
    }

    emitMetadataChange(): void {
        this.metadataChanged.emit({
            minutes: this.minutes(),
            seconds: this.seconds(),
        });
    }
}
