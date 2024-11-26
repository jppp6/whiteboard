import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WidgetSelector, WidgetType } from '../../../core/utils/types';

@Component({
    selector: 'toolbar',
    imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
    template: `
        <div class="toolbar-container">
            @for(widget of widgets(); track widget.type){
            <button
                mat-icon-button
                [matTooltip]="widget.tooltip"
                (click)="addWidget(widget.type)"
                class="toolbar-button"
            >
                <mat-icon>{{ widget.icon }}</mat-icon>
            </button>
            }
            <button
                mat-icon-button
                matTooltip="More Widgets"
                class="toolbar-button"
            >
                <mat-icon>more_horiz</mat-icon>
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

    widgets = signal<WidgetSelector[]>([
        { type: 'timer', icon: 'timer', tooltip: 'Add Timer' },
        { type: 'video', icon: 'tv', tooltip: 'Add Video' },
        { type: 'text', icon: 'notes', tooltip: 'Add Text' },
        { type: 'sticker', icon: 'image', tooltip: 'Add Sticker' },
        { type: 'chart', icon: 'table_chart', tooltip: 'Add Chart' },
        { type: 'date', icon: 'calendar_month', tooltip: "Add Today's Date" },
        { type: 'clock', icon: 'schedule', tooltip: 'Add Clock' },
        { type: 'checklist', icon: 'checklist', tooltip: 'Add Checklist' },
    ]);

    addWidget(type: WidgetType) {
        this.widgetSelected.emit(type);
    }
}
