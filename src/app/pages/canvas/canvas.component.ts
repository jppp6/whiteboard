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
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { CanvasPosition, Widget, WidgetType } from '../../core/utils/types';
import { defaultMetadata } from '../../core/utils/utils';
import { ChartWidget } from '../../widgets/charts/charts.component';
import { ChecklistWidget } from '../../widgets/checklist/checklist.component';
import { CountdownWidget } from '../../widgets/countdown/countdown.component';
import { ClockWidget } from '../../widgets/date-time/clock.component';
import { DateWidget } from '../../widgets/date-time/date.component';
import { StickerWidget } from '../../widgets/sticker/sticker.component';
import { TextWidget } from '../../widgets/text/text.component';
import { VideoWidget } from '../../widgets/video/video.component';
import { WidgetToolbar } from './toolbar/toolbar.component';

@Component({
    selector: 'widget-canvas',
    imports: [
        CommonModule,
        WidgetToolbar,
        CountdownWidget,
        TextWidget,
        StickerWidget,
        VideoWidget,
        ChartWidget,
        MatIconModule,
        DateWidget,
        ClockWidget,
        ChecklistWidget,
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
                    <video-player [metadata]="widget.metadata" /> }
                    @case('text') { <text [metadata]="widget.metadata" /> }
                    @case('sticker') {
                    <sticker [metadata]="widget.metadata" />
                    } @case('chart') { <chart [metadata]="widget.metadata" /> }
                    @case('checklist') {
                    <checklist
                        [metadata]="widget.metadata"
                        (metadataChanged)="handleMetaChange($event, widget)"
                    />
                    } @case('date') {
                    <date />
                    } @case('clock') {
                    <clock />
                    } @default { } }
                </div>
                }
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

    canvasContainer = viewChild.required<ElementRef>('canvasContainer');

    private _lastPanPosition = signal<CanvasPosition | null>(null);
    private _widgetStart = signal<CanvasPosition | null>(null);
    private _dragStart = signal<CanvasPosition | null>(null);
    private _offset = signal<CanvasPosition>({ x: 0, y: 0 });
    private _scale = signal<number>(1);

    selectedWidgetId = signal<string | null>(null);
    isPanning = signal<boolean>(false);
    whiteboardId = signal<string>('');
    widgets = signal<Widget[]>([]);

    transformStyle = computed(
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
        console.log(res);
        if (res.error) {
            this._snackBar.open(res.error, 'Dismiss', { duration: 1000 });
            this._router.navigate(['select']);
        } else {
            this.widgets.set(res.data.widgets);
        }
    }

    ngAfterViewInit(): void {
        const cr = this.canvasContainer().nativeElement.getBoundingClientRect();
        this._offset.set({
            x: (cr.width - 3000 * this._scale()) / 2,
            y: (cr.height - 3000 * this._scale()) / 2,
        });
    }

    private isInDeleteZone(event: MouseEvent): boolean {
        const rect =
            this.canvasContainer().nativeElement.getBoundingClientRect();
        return (
            event.clientX >= rect.right - 50 &&
            event.clientY >= rect.bottom - 50
        );
    }

    handleMetaChange(e: any, currentWidget: Widget) {
        switch (currentWidget.type) {
            case 'video':
            case 'sticker':
            case 'text':
            case 'timer':
                this.widgets.update((widgets) =>
                    widgets.map((widget) =>
                        widget.id === currentWidget.id
                            ? {
                                  ...widget,
                                  metadata: {
                                      seconds: e.seconds,
                                      minutes: e.minutes,
                                  },
                              }
                            : widget
                    )
                );
                break;
            case 'chart':
            case 'clock':
            case 'date':
            case 'checklist':
                this.widgets.update((widgets) =>
                    widgets.map((widget) =>
                        widget.id === currentWidget.id
                            ? {
                                  ...widget,
                                  metadata: {
                                      checklist: e.checklist,
                                      nextId: e.nextId,
                                  },
                              }
                            : widget
                    )
                );
        }
        this.updateSupabase();
    }

    addWidget(type: WidgetType): void {
        const cr = this.canvasContainer().nativeElement.getBoundingClientRect();
        const widget: Widget = {
            id: `${Date.now()}`,
            type,
            x: (cr.width / 2 - this._offset().x) / this._scale(),
            y: (cr.height / 2 - this._offset().y) / this._scale(),
            metadata: defaultMetadata(type),
        };
        this.widgets.update((widgets) => [...widgets, widget]);

        this.updateSupabase();
    }

    onCanvasMouseDown(event: MouseEvent): void {
        if (event.button !== 0 || this.selectedWidgetId()) return;

        this.isPanning.set(true);
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
        const lastPan = this._lastPanPosition();
        const startPos = this._widgetStart();
        const dragStart = this._dragStart();

        if (this.isPanning() && lastPan) {
            const deltaX = event.clientX - lastPan.x;
            const deltaY = event.clientY - lastPan.y;

            this._offset.update((current) => ({
                x: current.x + deltaX,
                y: current.y + deltaY,
            }));

            this._lastPanPosition.set({ x: event.clientX, y: event.clientY });
        } else if (this.selectedWidgetId() && dragStart && startPos) {
            const deltaX = (event.clientX - dragStart.x) / this._scale();
            const deltaY = (event.clientY - dragStart.y) / this._scale();

            this.widgets.update((widgets) =>
                widgets.map((widget) =>
                    widget.id === this.selectedWidgetId()
                        ? {
                              ...widget,
                              x: startPos.x + deltaX,
                              y: startPos.y + deltaY,
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
            this.updateSupabase();
        }

        this.isPanning.set(false);
        this.selectedWidgetId.set(null);
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

    updateSupabase(): void {
        this._supabaseService.updateWhiteboard(
            this.whiteboardId(),
            this.widgets()
        );
    }
}
