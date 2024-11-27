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
        <div class="chart-wrapper">
            <div class="drag-handle">
                <mat-icon>drag_indicator</mat-icon>
            </div>
            <div class="chart-container" (mousedown)="$event.stopPropagation()">
                <div class="edit-button" (click)="openChartDataDialog()">
                    <mat-icon>edit</mat-icon>
                </div>
                <div>
                    <mat-grid-list class="grid-list" [cols]="dimension()">
                        @for(v of tiles() ; track v) {
                        <mat-grid-tile style="outline: solid 1px;">
                        </mat-grid-tile>
                        }
                    </mat-grid-list>
                </div>
            </div>
        </div>
    `,
    styles: [
        `
            .grid-list {
                width: 234px;
                height: 234px;
            }

            .chart-wrapper {
                display: flex;
                justify-content: center;
                width: 256px;
                height: 256px;
            }

            .chart-container {
                background: white;
                padding: 16px;
                width: 234px;
                height: 234px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .chart-wrapper:hover .drag-handle {
                opacity: 1;
            }

            .chart-wrapper:hover .edit-button {
                opacity: 1;
            }
        `,
    ],
})
export class ChartWidget implements OnInit {
    metadata = input.required<{ dimension: number }>();
    @Output() metadataChanged = new EventEmitter<{
        dimension: number;
    }>();

    private readonly _dialog = inject(MatDialog);

    dimension = signal<number>(10);
    tiles = computed<number[]>(() => [
        ...Array(this.dimension() * this.dimension()).keys(),
    ]);

    ngOnInit(): void {
        this.dimension.set(this.metadata().dimension);
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

    emitMetadataChange(): void {
        this.metadataChanged.emit({
            dimension: this.dimension(),
        });
    }
}
