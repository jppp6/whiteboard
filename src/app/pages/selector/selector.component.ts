import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { Whiteboard } from '../../core/utils/types';
import { CreateWhiteBoardDialog } from './create-board/create-board.component';

@Component({
    selector: 'board-selector',
    imports: [MatIconModule],
    template: `
        <div class="selector-container">
            <div class="selector-grid">
                <div class="board-option" (click)="getBoardInfo()">
                    New Board
                    <mat-icon>add</mat-icon>
                </div>
                @for (board of boards(); track board.id) {
                <div class="board-option" (click)="selectBoard(board.id)">
                    {{ board.name }}
                </div>
                }
            </div>
        </div>
    `,
    styles: [
        `
            .selector-container {
                max-width: 825px;
                margin: 0 auto;
                padding-top: 80px;
            }

            .selector-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
                justify-content: center;
            }

            .board-option {
                aspect-ratio: 16 / 9;
                padding: 8px;
                border: 2px solid transparent;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                border-color: #666666;
            }

            .board-option:hover {
                background: rgba(0, 0, 0, 0.04);
            }

            @media (max-width: 768px) {
                .selector-grid {
                    grid-template-columns: repeat(3, 1fr);
                }
            }

            @media (max-width: 600px) {
                .selector-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        `,
    ],
})
export class Selector implements OnInit {
    private readonly _supabaseClient = inject(SupabaseService);
    private readonly _snackBar = inject(MatSnackBar);
    private readonly _router = inject(Router);
    private readonly _dialog = inject(MatDialog);

    boards = signal<Whiteboard[]>([]);

    async ngOnInit(): Promise<void> {
        const res = await this._supabaseClient.getAllWhiteboards();
        if (res.error) {
            this._snackBar.open(res.error, 'Dismiss', { duration: 1000 });
            this.boards.set([]);
        } else {
            this.boards.set(res.data);
        }
    }

    async getBoardInfo(): Promise<void> {
        const dialogRef = this._dialog.open(CreateWhiteBoardDialog, {
            width: '400px',
        });

        dialogRef
            .afterClosed()
            .subscribe((result: { name: string; notes: string }) => {
                if (!result.name) {
                    return;
                }
                this.createBoard(result.name, result.notes);
            });
    }

    async createBoard(name: string, notes: string): Promise<void> {
        const res = await this._supabaseClient.newWhiteboard(name, notes);
        if (res.error) {
            this._snackBar.open(res.error, 'Dismiss', { duration: 1000 });
            return;
        }
        this.selectBoard(res.data);
    }

    selectBoard(id: string): void {
        this._router.navigate(['whiteboard', id]);
    }
}
