import {
    Component,
    EventEmitter,
    input,
    OnInit,
    Output,
    signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { ChecklistItem } from '../../core/utils/types';

@Component({
    selector: 'checklist',
    imports: [
        FormsModule,
        MatInputModule,
        MatButtonModule,
        MatListModule,
        MatIconModule,
        MatCheckboxModule,
        MatFormFieldModule,
    ],

    template: `
        <div class="checklist-wrapper">
            <div class="drag-handle">
                <mat-icon>drag_indicator</mat-icon>
            </div>
            <div
                class="checklist-container"
                (mousedown)="$event.stopPropagation()"
            >
                <mat-form-field
                    appearance="outline"
                    class="w100"
                    subscriptSizing="dynamic"
                >
                    <mat-label>Add item</mat-label>
                    <input
                        matInput
                        [(ngModel)]="newItem"
                        (keyup.enter)="addItem()"
                    />

                    @if (newItem().trim() !== '') {
                    <button matSuffix mat-icon-button (click)="addItem()">
                        <mat-icon>add</mat-icon>
                    </button>
                    }
                </mat-form-field>

                <mat-list>
                    @for (item of checklist(); track item.id) {
                    <mat-list-item>
                        <div class="item">
                            <mat-checkbox
                                [checked]="item.completed"
                                (change)="toggleItem(item)"
                            >
                                <span [class.completed]="item.completed">
                                    {{ item.text }}
                                </span>
                            </mat-checkbox>
                            <button mat-icon-button (click)="deleteItem(item)">
                                <mat-icon>delete</mat-icon>
                            </button>
                        </div>
                    </mat-list-item>
                    } @empty {
                    <mat-list-item> Nothing... </mat-list-item>
                    }
                </mat-list>
            </div>
        </div>
    `,
    styles: [
        `
            .checklist-wrapper {
                width: 282px;
            }

            .checklist-container {
                background: white;
                padding: 16px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                width: 250px;
            }

            .checklist-wrapper:hover .drag-handle {
                opacity: 1;
            }

            .item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
            }

            .completed {
                text-decoration: line-through;
                color: #666;
            }
        `,
    ],
})
export class ChecklistWidget implements OnInit {
    metadata = input.required<{ checklist: ChecklistItem[]; nextId: number }>();
    @Output() metadataChanged = new EventEmitter<{
        checklist: ChecklistItem[];
        nextId: number;
    }>();

    checklist = signal<ChecklistItem[]>([]);
    newItem = signal<string>('');
    private _nextId: number = 0;

    ngOnInit(): void {
        this.checklist.set(this.metadata().checklist);
        this._nextId = this.metadata().nextId;
    }

    addItem(): void {
        const text = this.newItem().trim();
        if (text) {
            this.checklist.update((items) => [
                ...items,
                {
                    id: this._nextId++,
                    text,
                    completed: false,
                },
            ]);
            this.newItem.set('');
            this.emitMetadataChange();
        }
    }

    toggleItem(item: ChecklistItem): void {
        this.checklist.update((checklist) =>
            checklist.map((t) =>
                t.id === item.id ? { ...t, completed: !t.completed } : t
            )
        );
        this.emitMetadataChange();
    }

    deleteItem(item: ChecklistItem): void {
        this.checklist.update((checklist) =>
            checklist.filter((t) => t.id !== item.id)
        );
        this.emitMetadataChange();
    }

    emitMetadataChange(): void {
        this.metadataChanged.emit({
            checklist: this.checklist(),
            nextId: this._nextId,
        });
    }
}
