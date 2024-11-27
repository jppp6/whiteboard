import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    Component,
    computed,
    ElementRef,
    inject,
    OnInit,
    signal,
    viewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { CanvasPosition, Widget, WidgetType } from '../../core/utils/types';
import { defaultMetadata } from '../../core/utils/utils';
import { CalendarWidget } from '../../widgets/calendar/calendar.component';
import { ChartWidget } from '../../widgets/charts/charts.component';
import { ChecklistWidget } from '../../widgets/checklist/checklist.component';
import { CountdownWidget } from '../../widgets/countdown/countdown.component';
import { ClockWidget } from '../../widgets/date-time/clock.component';
import { DateWidget } from '../../widgets/date-time/date.component';
import { GroupGeneratorWidget } from '../../widgets/group-generator/group-generator.component';
import { StickerWidget } from '../../widgets/sticker/sticker.component';
import { TextWidget } from '../../widgets/text/text.component';
import { VideoWidget } from '../../widgets/video/video.component';
import { EditComponent } from './edit/edit.component';
import { WidgetToolbar } from './toolbar/toolbar.component';

@Component({
    selector: 'widget-canvas',
    imports: [
        CommonModule,
        WidgetToolbar,
        CountdownWidget,
        TextWidget,
        // StickerWidget,
        VideoWidget,
        ChartWidget,
        MatIconModule,
        DateWidget,
        ClockWidget,
        ChecklistWidget,
        CalendarWidget,
        GroupGeneratorWidget,
        StickerWidget,
    ],
    template: `
        <toolbar (widgetSelected)="addWidget($event)"></toolbar>
        <div
            #canvasContainer
            class="canvas-container"
            (mousedown)="onCanvasMouseDown($event)"
            (mousemove)="onMouseMove($event)"
            (mouseup)="onMouseUp($event)"
            (mouseleave)="onMouseUp($event)"
            (wheel)="handleZoom($event)"
        >
            <div class="canvas" [style.transform]="transformStyle()">
                <div class="grid-background"></div>

                @for (widget of widgets(); track widget.id){
                <div
                    class="widget"
                    [style.transform]="getWidgetTransform(widget)"
                    [class.dragging]="widget.id === selectedWidgetId()"
                    (mousedown)="onWidgetMouseDown($event, widget)"
                >
                    @switch (widget.type) { @case ('timer') {
                    <countdown
                        [metadata]="widget.metadata"
                        (metadataChanged)="handleMetaChange($event, widget)"
                    />
                    } @case ('video') {
                    <video-player
                        [metadata]="widget.metadata"
                        (metadataChanged)="handleMetaChange($event, widget)"
                    />
                    } @case('text') {
                    <text
                        [metadata]="widget.metadata"
                        (metadataChanged)="handleMetaChange($event, widget)"
                    />
                    } @case('sticker-s') {
                    <sticker
                        [metadata]="widget.metadata"
                        (metadataChanged)="handleMetaChange($event, widget)"
                    />
                    }@case('sticker-l') {
                    <sticker
                        [metadata]="widget.metadata"
                        (metadataChanged)="handleMetaChange($event, widget)"
                    />
                    } @case('chart') {
                    <chart
                        [metadata]="widget.metadata"
                        (metadataChanged)="handleMetaChange($event, widget)"
                    />
                    } @case('checklist') {
                    <checklist
                        [metadata]="widget.metadata"
                        (metadataChanged)="handleMetaChange($event, widget)"
                    />
                    } @case('groups') {
                    <group-generator
                        [metadata]="widget.metadata"
                        (metadataChanged)="handleMetaChange($event, widget)"
                    />
                    }@case('date') {
                    <date />
                    } @case('clock') {
                    <clock />
                    } @case('calendar') {
                    <calendar />
                    } }
                </div>
                }
            </div>
            <div class="edit-zone" [class.active]="isMouseInEditZone()">
                <div class="edit" (click)="handleEditClick()">
                    <mat-icon>edit</mat-icon>
                </div>
            </div>
            <div
                class="delete-zone"
                [class.active]="selectedWidgetId() !== null"
            >
                <mat-icon>delete</mat-icon>
            </div>
        </div>
    `,
    styles: [
        `
            .canvas-container {
                width: 100%;
                height: 100vh;
                overflow: hidden;
                position: relative;
                background-color: #f0f0f0;
            }

            .canvas {
                position: absolute;
                width: 3000px;
                height: 3000px;
                transform-origin: top left;
                transition: transform 0.05s linear;
            }

            .grid-background {
                width: 100%;
                height: 100%;
                position: absolute;
                background-size: 20px 20px;
                background-image: linear-gradient(
                        to right,
                        #e0e0e0 1px,
                        transparent 1px
                    ),
                    linear-gradient(to bottom, #e0e0e0 1px, transparent 1px);
            }

            .widget {
                position: absolute;
                transition: transform 0.05s linear;
            }

            .widget.dragging {
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                opacity: 0.9;
                transition: none;
                z-index: 100;
            }

            .edit {
                position: fixed;
                bottom: 20px;
                left: 20px;
                width: 50px;
                height: 50px;
                background-color: rgba(0, 0, 255, 0.1);
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            .edit-zone {
                position: fixed;
                bottom: 0px;
                left: 0px;
                width: 100px;
                height: 100px;
                transition: all 0.2s ease;
                border-radius: 4px;
                opacity: 0;
            }

            .edit-zone.active {
                opacity: 1;
            }

            .delete-zone {
                position: fixed;
                bottom: 0px;
                right: 0px;
                width: 50px;
                height: 50px;
                background-color: rgba(255, 0, 0, 0.1);
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: all 0.2s ease;
                pointer-events: none;
            }

            .delete-zone.active {
                opacity: 1;
                background-color: rgba(255, 0, 0, 0.2);
            }
        `,
    ],
})
export class WidgetCanvas implements OnInit, AfterViewInit {
    private readonly _supabaseService = inject(SupabaseService);
    private readonly _snackBar = inject(MatSnackBar);
    private readonly _router = inject(Router);
    private readonly _activatedRoute = inject(ActivatedRoute);
    private readonly _dialog = inject(MatDialog);

    canvasContainer = viewChild.required<ElementRef>('canvasContainer');

    private _lastPanPosition = signal<CanvasPosition | null>(null);
    private _mousePosition = signal<CanvasPosition | null>(null);
    private _widgetStart = signal<CanvasPosition | null>(null);
    private _dragStart = signal<CanvasPosition | null>(null);
    private _offset = signal<CanvasPosition>({ x: 0, y: 0 });
    private _isPanning = signal<boolean>(false);
    private _scale = signal<number>(1);

    selectedWidgetId = signal<string | null>(null);
    // State
    whiteboardId = signal<string>('');
    whiteboardName = signal<string>('');
    whiteboardNotes = signal<string>('');
    widgets = signal<Widget[]>([]);

    transformStyle = computed<string>(
        () =>
            `translate(${this._offset().x}px, ${
                this._offset().y
            }px) scale(${this._scale()})`
    );

    async ngOnInit() {
        const id = this._activatedRoute.snapshot.paramMap.get('id');
        if (id) {
            this.whiteboardId.set(id);
        }
        const res = await this._supabaseService.getWhiteboard(
            this.whiteboardId()
        );
        if (res.error) {
            this._snackBar.open(res.error, 'Dismiss', { duration: 1000 });
            this._router.navigate(['select']);
        } else {
            this.widgets.set(res.data.widgets);
            this.whiteboardName.set(res.data.name);
            this.whiteboardNotes.set(res.data.notes);
        }
    }

    ngAfterViewInit(): void {
        const cr = this.canvasContainer().nativeElement.getBoundingClientRect();
        this._offset.set({
            x: (cr.width - 3000 * this._scale()) / 2,
            y: (cr.height - 3000 * this._scale()) / 2,
        });
    }

    onMouseLeave(event: MouseEvent): void {
        this._mousePosition.set(null);
        this.onMouseUp(event);
    }

    isMouseInEditZone(): boolean {
        const mousePos = this._mousePosition();
        if (!mousePos) return false;

        const rect =
            this.canvasContainer().nativeElement.getBoundingClientRect();
        return mousePos.x <= rect.left + 100 && mousePos.y >= rect.bottom - 100;
    }

    private isInDeleteZone(event: MouseEvent): boolean {
        const rect =
            this.canvasContainer().nativeElement.getBoundingClientRect();
        return (
            event.clientX >= rect.right - 50 &&
            event.clientY >= rect.bottom - 50
        );
    }

    handleEditClick(): void {
        const dialogRef = this._dialog.open(EditComponent, {
            width: '500px',
            panelClass: 'edit-dialog',
            data: {
                name: this.whiteboardName(),
                notes: this.whiteboardNotes(),
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.delete) {
                this.deleteSupabaseWhiteboard();
            } else if (result && result.name) {
                this.whiteboardName.set(result.name);
                this.whiteboardNotes.set(result.notes);
                this.updateSupabaseWhiteboardName();
            }
        });
    }

    handleMetaChange(e: any, current: Widget) {
        this.widgets.update((widgets) =>
            widgets.map((w) =>
                w.id === current.id
                    ? {
                          ...w,
                          metadata: {
                              ...e,
                          },
                      }
                    : w
            )
        );
        this.updateSupabaseWidgets();
    }

    addWidget(type: WidgetType): void {
        const cr = this.canvasContainer().nativeElement.getBoundingClientRect();
        const widget: Widget = {
            id: `${Date.now()}`,
            type: type,
            x: (cr.width / 2 - this._offset().x) / this._scale(),
            y: (cr.height / 2 - this._offset().y) / this._scale(),
            metadata: defaultMetadata(type),
        };
        this.widgets.update((widgets) => [...widgets, widget]);

        this.updateSupabaseWidgets();
    }

    onCanvasMouseDown(event: MouseEvent): void {
        if (event.button !== 0 || this.selectedWidgetId()) return;

        this._isPanning.set(true);
        this._lastPanPosition.set({ x: event.clientX, y: event.clientY });
    }

    onWidgetMouseDown(event: MouseEvent, widget: Widget): void {
        if (event.button !== 0) return;

        event.stopPropagation();
        this.selectedWidgetId.set(widget.id);
        this._dragStart.set({ x: event.clientX, y: event.clientY });
        this._widgetStart.set({ x: widget.x, y: widget.y });
    }

    onMouseMove(event: MouseEvent): void {
        const { x, y } = { x: event.clientX, y: event.clientY };
        this._mousePosition.set({ x: x, y: y });

        const lastPan = this._lastPanPosition();
        const startPos = this._widgetStart();
        const dragStart = this._dragStart();

        if (this._isPanning() && lastPan) {
            this._offset.update((current) => ({
                x: current.x + x - lastPan.x,
                y: current.y + y - lastPan.y,
            }));

            this._lastPanPosition.set({ x: x, y: y });
        } else if (this.selectedWidgetId() && dragStart && startPos) {
            this.widgets.update((widgets) =>
                widgets.map((widget) =>
                    widget.id === this.selectedWidgetId()
                        ? {
                              ...widget,
                              x: startPos.x + (x - dragStart.x) / this._scale(),
                              y: startPos.y + (y - dragStart.y) / this._scale(),
                          }
                        : widget
                )
            );
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.selectedWidgetId()) {
            if (this.isInDeleteZone(event)) {
                // Delete the widget
                this.widgets.update((widgets) =>
                    widgets.filter((w) => w.id !== this.selectedWidgetId())
                );
                this._snackBar.open('Widget deleted', 'Dismiss', {
                    duration: 1000,
                    horizontalPosition: 'left',
                });
            }
            // this is updates after move and after delete
            this.updateSupabaseWidgets();
        }

        this.selectedWidgetId.set(null);
        this._isPanning.set(false);
        this._lastPanPosition.set(null);
        this._widgetStart.set(null);
        this._dragStart.set(null);
    }

    handleZoom(event: WheelEvent): void {
        event.preventDefault();

        const zoomSensitivity = 0.001;
        const deltaY = event.deltaY;
        const scaleChange = 1 - deltaY * zoomSensitivity;
        const newScale = Math.min(
            Math.max(this._scale() * scaleChange, 0.1),
            3
        );

        const rect =
            this.canvasContainer().nativeElement.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        this._offset.update((current) => ({
            x: mouseX - (mouseX - current.x) * (newScale / this._scale()),
            y: mouseY - (mouseY - current.y) * (newScale / this._scale()),
        }));

        this._scale.set(newScale);
    }

    getWidgetTransform(widget: Widget): string {
        return `translate(${widget.x}px, ${widget.y}px)`;
    }

    updateSupabaseWidgets(): void {
        this._supabaseService.updateWidgets(
            this.whiteboardId(),
            this.widgets()
        );
    }

    updateSupabaseWhiteboardName(): void {
        this._supabaseService.updateName(
            this.whiteboardId(),
            this.whiteboardName(),
            this.whiteboardNotes()
        );
    }

    async deleteSupabaseWhiteboard() {
        const res = await this._supabaseService.deleteWhiteboard(
            this.whiteboardId()
        );

        if (res.error) {
            this._snackBar.open(res.error, 'Dismiss', { duration: 1000 });
        } else {
            this._snackBar.open(`${this.whiteboardName()} deleted`, 'Dismiss', {
                duration: 1000,
            });
            this._router.navigate(['whiteboards']);
        }
    }
}
