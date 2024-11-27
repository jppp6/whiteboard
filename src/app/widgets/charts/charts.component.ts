import { CommonModule } from '@angular/common';
import {
    Component,
    computed,
    EventEmitter,
    inject,
    input,
    OnInit,
    Output,
    signal,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { EditChartDialog } from './edit/edit-chart.component';

@Component({
    selector: 'chart',
    imports: [CommonModule, MatIconModule, MatGridListModule],
    template: `
        <div
            class="content-wrapper"
            [style.width.px]="width()"
            [style.height.px]="width()"
        >
            <mat-icon class="drag-handle">drag_indicator</mat-icon>
            <div
                class="content-container"
                [style.width.px]="width() - 32"
                [style.height.px]="width() - 32"
                (mousedown)="$event.stopPropagation()"
            >
                <mat-icon class="edit-button" (click)="openChartDataDialog()">
                    edit
                </mat-icon>

                <mat-grid-list [cols]="dimension()">
                    @for(v of tiles() ; track v) {
                    <mat-grid-tile style="outline: solid 1px;"></mat-grid-tile>
                    }
                </mat-grid-list>

                <div
                    class="resize-handle"
                    (mousedown)="startResize($event)"
                ></div>
            </div>
        </div>
    `,
})
export class ChartWidget implements OnInit {
    metadata = input.required<{
        dimension: number;
        width: number;
    }>();
    @Output() metadataChanged = new EventEmitter<{
        dimension: number;
        width: number;
    }>();

    private readonly _dialog = inject(MatDialog);

    width = signal<number>(256);
    dimension = signal<number>(10);
    tiles = computed<number[]>(() => [
        ...Array(this.dimension() * this.dimension()).keys(),
    ]);

    private _resizing = signal<boolean>(false);
    private _startWidth = signal<number>(0);
    private _startX = signal<number>(0);
    private _startY = signal<number>(0);

    ngOnInit(): void {
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));

        this.dimension.set(this.metadata().dimension);
        this.width.set(this.metadata().width);
    }

    openChartDataDialog(): void {
        const dialogRef = this._dialog.open(EditChartDialog, {
            data: { dimension: this.dimension() },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.dimension) {
                this.dimension.set(result.dimension);
                this.emitMetadataChange();
            }
        });
    }

    startResize(e: MouseEvent): void {
        this._resizing.set(true);
        this._startX.set(e.clientX);
        this._startY.set(e.clientY);
        this._startWidth.set(this.width());
    }

    private onMouseMove(e: MouseEvent): void {
        if (!this._resizing()) return;
        this.width.set(
            Math.max(200, this._startWidth() + e.clientX - this._startX())
        );
    }

    private onMouseUp(): void {
        this._resizing.set(false);
        this.emitMetadataChange();
    }

    emitMetadataChange(): void {
        this.metadataChanged.emit({
            dimension: this.dimension(),
            width: this.width(),
        });
    }
}
