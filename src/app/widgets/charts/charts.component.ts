import { CommonModule } from '@angular/common';
import {
    Component,
    computed,
    inject,
    input,
    model,
    signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import {
    MatDialog,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ChartConfiguration, ChartType as Ng2ChartType } from 'chart.js';
import {
    BaseChartDirective,
    provideCharts,
    withDefaultRegisterables,
} from 'ng2-charts';

type ChartType = 'line' | 'bar' | 'area' | 'pie';

interface ChartOption {
    value: ChartType;
    label: string;
}

@Component({
    selector: 'chart-data-dialog',
    imports: [
        MatButtonModule,
        MatOptionModule,
        FormsModule,
        CommonModule,
        MatSelectModule,
        MatDialogModule,
        MatFormFieldModule,
    ],
    template: `
        <mat-dialog-content class="dialog-container">
            <mat-form-field appearance="outline">
                <mat-label>Chart Type</mat-label>
                <mat-select [(ngModel)]="selectedChartType">
                    @for (option of chartOptions; track option.label) {
                    <mat-option [value]="option.value">
                        {{ option.label }}
                    </mat-option>
                    }
                </mat-select>
            </mat-form-field>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
            <button mat-button mat-dialog-close>Cancel</button>
            <button
                mat-button
                (click)="confirm()"
                [disabled]="!selectedChartType"
                cdkFocusInitial
            >
                Submit
            </button>
        </mat-dialog-actions>
    `,
})
class ChartDataDialog {
    selectedChartType = model<ChartType>('line');

    chartData = [
        { name: 'Jan', sales: 4000, profit: 2400, revenue: 6000 },
        { name: 'Feb', sales: 3000, profit: 1398, revenue: 5000 },
        { name: 'Mar', sales: 2000, profit: 9800, revenue: 4000 },
        { name: 'Apr', sales: 2780, profit: 3908, revenue: 7000 },
        { name: 'May', sales: 1890, profit: 4800, revenue: 5600 },
    ];

    chartSeries = [
        { dataKey: 'sales', color: '#8884d8' },
        { dataKey: 'profit', color: '#82ca9d' },
        { dataKey: 'revenue', color: '#ffc658' },
    ];
    readonly chartOptions: ChartOption[] = [
        { value: 'line', label: 'Line Chart' },
        { value: 'bar', label: 'Bar Chart' },
        { value: 'area', label: 'Area Chart' },
        { value: 'pie', label: 'Pie Chart' },
    ];
    private dialogRef = inject(MatDialogRef<ChartDataDialog>);

    close() {
        this.dialogRef.close();
    }

    confirm() {
        this.dialogRef.close({
            selectedChartType: this.selectedChartType(),
            series: this.chartSeries,
            data: this.chartData,
        });
    }
}

@Component({
    selector: 'chart',
    providers: [provideCharts(withDefaultRegisterables())],
    imports: [
        CommonModule,
        MatSelectModule,
        MatFormFieldModule,
        MatCardModule,
        BaseChartDirective,
        MatIconModule,
        FormsModule,
    ],
    template: `
        <div class="chart-wrapper">
            <div class="drag-handle">
                <mat-icon>drag_indicator</mat-icon>
            </div>
            <div class="chart-container" (mousedown)="$event.stopPropagation()">
                <div class="edit-button" (click)="openChartDataDialog()">
                    <mat-icon>edit</mat-icon>
                </div>

                <div class="chart-wrapper">
                    <canvas
                        baseChart
                        [type]="chartTypeMap[selectedChartType()]"
                        [data]="chartData()"
                        [options]="options"
                    >
                    </canvas>
                </div>
            </div>
        </div>
    `,
    styles: [
        `
            .chart-wrapper {
                display: flex;
                justify-content: center;
                width: 332px;
            }

            .chart-container {
                background: white;
                padding: 16px;
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
export class ChartWidget {
    metadata = input.required<{}>();

    data = signal<any[]>([]);
    series = signal<{ dataKey: string; color: string }[]>([]);
    selectedChartType = signal<ChartType>('line');

    private dialog = inject(MatDialog);

    openChartDataDialog() {
        const dialogRef = this.dialog.open(ChartDataDialog, {});

        dialogRef.afterClosed().subscribe((result) => {
            if (!result) {
                return;
            }
            this.selectedChartType.set(result.selectedChartType);
            this.series.set(result.series);
            this.data.set(result.data);
        });
    }

    chartTypeMap: Record<ChartType, Ng2ChartType> = {
        line: 'line',
        bar: 'bar',
        area: 'line',
        pie: 'pie',
    };

    options: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    chartData = computed(() => {
        if (!this.data() || !this.series()) return { datasets: [] };

        if (this.selectedChartType() === 'pie') {
            const firstDataPoint = this.data()[0];
            return {
                labels: this.series().map((s) => s.dataKey),
                datasets: [
                    {
                        data: this.series().map(
                            (s) => firstDataPoint[s.dataKey]
                        ),
                        backgroundColor: this.series().map((s) => s.color),
                    },
                ],
            };
        }

        const labels = this.data().map((d) => d.name);
        const datasets = this.series().map((series) => ({
            label: series.dataKey,
            data: this.data().map((d) => d[series.dataKey]),
            borderColor: series.color,
            backgroundColor:
                this.selectedChartType() === 'area'
                    ? this.createGradient(series.color)
                    : series.color,
            fill: this.selectedChartType() === 'area',
            tension: this.selectedChartType() === 'area' ? 0.3 : 0,
        }));

        return {
            labels,
            datasets,
        };
    });

    private createGradient(color: string): string {
        return `${color}40`; // 40 is the hex value for 25% opacity
    }
}
