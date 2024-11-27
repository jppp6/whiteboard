import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WidgetSelector, WidgetType } from '../../../core/utils/types';

@Component({
    selector: 'toolbar',
    imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
    template: `
        <div class="toolbar-container">
            @for(widget of widgets; track widget.type){
            <button
                class="toolbar-button"
                mat-icon-button
                [matTooltip]="widget.tooltip"
                (click)="addWidget(widget.type)"
            >
                <mat-icon>{{ widget.icon }}</mat-icon>
            </button>
            }

            <!-- <button
                mat-icon-button
                matTooltip="More Widgets"
                class="toolbar-button"
            >
                <mat-icon>more_horiz</mat-icon>
            </button> -->
        </div>
        <div class="zoom-container">
            <button
                mat-icon-button
                class="toolbar-button"
                (click)="emitZoomEvent('in')"
            >
                <mat-icon>zoom_in</mat-icon>
            </button>
            <button
                mat-icon-button
                class="toolbar-button"
                (click)="emitZoomEvent('out')"
            >
                <mat-icon>zoom_out</mat-icon>
            </button>
        </div>
    `,
    styles: [
        `
            .toolbar-container {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: white;
                border-radius: 8px;
                padding: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                display: flex;
                gap: 8px;
                z-index: 1000;
            }

            .zoom-container {
                position: fixed;
                top: 80px;
                right: 20px;
                height: 40px;
                background-color: white;
                border-radius: 20px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                display: flex;
                z-index: 1000;
            }

            .toolbar-button {
                color: #666;
                transition: color 0.2s;
            }

            .toolbar-button:hover {
                color: #005cbb;
            }
        `,
    ],
})
export class WidgetToolbar {
    @Output() widgetSelected = new EventEmitter<WidgetType>();
    @Output() zoomEvent = new EventEmitter<'in' | 'out'>();

    readonly widgets: WidgetSelector[] = [
        { type: 'text', icon: 'notes', tooltip: 'Add Text' },
        { type: 'video', icon: 'tv', tooltip: 'Add Video' },
        { type: 'chart', icon: 'table_chart', tooltip: 'Add Chart' },
        { type: 'checklist', icon: 'checklist', tooltip: 'Add Checklist' },
        { type: 'groups', icon: 'groups', tooltip: 'Add Groups' },
        { type: 'sticker', icon: 'image', tooltip: 'Add Image' },
        { type: 'date', icon: 'today', tooltip: 'Add Date' },
        { type: 'calendar', icon: 'calendar_month', tooltip: 'Add Calendar' },
        { type: 'timer', icon: 'timer', tooltip: 'Add Timer' },
        { type: 'clock', icon: 'schedule', tooltip: 'Add Clock' },
    ];

    addWidget(type: WidgetType): void {
        this.widgetSelected.emit(type);
    }

    emitZoomEvent(type: 'in' | 'out'): void {
        this.zoomEvent.emit(type);
    }
}
