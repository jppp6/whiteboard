import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    input,
    model,
    Output,
    signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { Person } from '../../core/utils/types';

@Component({
    selector: 'group-generator',
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatChipsModule,
        MatCardModule,
        MatSliderModule,
    ],
    template: `
        <div class="group-wrapper">
            <div class="drag-handle">
                <mat-icon>drag_indicator</mat-icon>
            </div>

            <div class="group-container" (mousedown)="$event.stopPropagation()">
                <mat-form-field appearance="outline" class="w100">
                    <mat-label>Add Person</mat-label>
                    <input
                        matInput
                        [(ngModel)]="newPerson"
                        (keyup.enter)="addPerson()"
                    />

                    @if (newPerson().trim() !== '') {
                    <button matSuffix mat-icon-button (click)="addPerson()">
                        <mat-icon>add</mat-icon>
                    </button>
                    }
                </mat-form-field>

                <div class="w100" style="display: flex; gap: 16px; ">
                    <mat-form-field
                        appearance="outline"
                        subscriptSizing="dynamic"
                    >
                        <mat-label># Groups</mat-label>
                        <input
                            matInput
                            type="number"
                            [(ngModel)]="numGroups"
                            min="1"
                            max="10"
                        />
                    </mat-form-field>

                    <button
                        mat-raised-button
                        color="accent"
                        (click)="generateGroups()"
                        [disabled]="people().length < 1 || numGroups() > 10"
                    >
                        Generate
                    </button>
                    <button
                        mat-raised-button
                        color="accent"
                        (click)="toggleShowGroupList()"
                        [disabled]="people().length < 1"
                    >
                        {{ showGroupList() ? 'Hide' : 'Show' }}
                    </button>
                </div>

                @if (showGroupList() && people().length !== 0){
                <div class="people-list">
                    <mat-chip-set>
                        @for (person of people(); track person.id) {
                        <mat-chip (removed)="removePerson(person)">
                            {{ person.name }}
                            <mat-icon matChipRemove>cancel</mat-icon>
                        </mat-chip>
                        }
                    </mat-chip-set>
                </div>
                } @if(generatedGroups().length>0) {
                <div class="generated-groups">
                    @for (group of generatedGroups(); track group.id) {
                    <div class="group-card">
                        <strong>Group {{ group.id }}</strong>
                        <ul>
                            @for (member of group.members; track member.id) {
                            <li>{{ member.name }}</li>
                            }
                        </ul>
                    </div>
                    }
                </div>
                }
            </div>
        </div>
    `,
    styles: [
        `
            .group-wrapper {
                width: 332px;
            }

            .group-wrapper:hover .drag-handle {
                opacity: 1;
            }

            .group-container {
                background: white;
                padding: 16px;
                width: 300px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .people-list {
                padding-top: 12px;
                margin-bottom: 8px;
            }

            .generated-groups {
                padding-top: 16px;
            }

            .group-card {
                padding: 15px;
                border: 1px solid #ccc;
                border-radius: 4px;
                background-color: #f5f5f5;
            }

            .group-card ul {
                list-style-type: none;
                padding: 0;
                margin: 0;
            }
        `,
    ],
})
export class GroupGeneratorWidget {
    metadata = input.required<{
        people: Person[];
        nextId: number;
    }>();
    @Output() metadataChanged = new EventEmitter<{
        people: Person[];
        nextId: number;
    }>();

    people = signal<Person[]>([]);
    newPerson = model<string>('');
    numGroups = model<number>(1);
    generatedGroups = signal<Array<{ id: number; members: Person[] }>>([]);

    showGroupList = signal<boolean>(true);
    private _nextId = 0;

    ngOnInit(): void {
        this.people.set(this.metadata().people);
        this._nextId = this.metadata().nextId;
    }

    addPerson(): void {
        const p = this.newPerson().trim();
        if (p) {
            this.people.update((people) => [
                ...people,
                { name: p, id: this._nextId++ },
            ]);
            this.newPerson.set('');
            this.emitMetadataChange();
        }
    }

    removePerson(student: Person): void {
        this.people.update((people) =>
            people.filter((s) => s.id !== student.id)
        );
        this.emitMetadataChange();
    }

    generateGroups(): void {
        const shuffled = [...this.people()].sort(() => Math.random() - 0.5);
        const groups = Array(this.numGroups())
            .fill(null)
            .map((_, i) => ({
                id: i + 1,
                members: [] as Person[],
            }));

        shuffled.forEach((person, index) => {
            const groupIndex = index % this.numGroups();
            groups[groupIndex].members.push(person);
        });

        this.generatedGroups.set(groups);
    }

    toggleShowGroupList(): void {
        this.showGroupList.update((s) => !s);
    }

    emitMetadataChange(): void {
        this.metadataChanged.emit({
            people: this.people(),
            nextId: this._nextId,
        });
    }
}
