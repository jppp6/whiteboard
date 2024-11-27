import {
    animate,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from '../services/supabase.service';

@Component({
    selector: 'app-header',
    imports: [MatButtonModule, MatIconModule, RouterLink],
    template: `
        @if (session()) {
        <div
            class="header-container left"
            [@leftExpandCollapse]="isExpanded() ? 'expanded' : 'collapsed'"
            (mouseenter)="expand()"
            (mouseleave)="collapse()"
        >
            <div class="content-wrapper">
                <div style="height: 24px; width: 24px">
                    <mat-icon>
                        {{ isExpanded() ? 'chevron_right' : 'chevron_left' }}
                    </mat-icon>
                </div>
                &nbsp; &nbsp;

                <div class="buttons-section">
                    <a mat-button routerLink="/whiteboards">
                        <mat-icon>dashboard_customize</mat-icon>
                        <span>Whiteboards</span>
                    </a>
                    <a mat-button routerLink="/help" [disabled]="true">
                        <mat-icon>question_mark</mat-icon>
                        <span>Help</span>
                    </a>
                    <button mat-button (click)="signOut()">
                        <mat-icon>logout</mat-icon>
                        <span>Log Out</span>
                    </button>
                </div>
            </div>
        </div>
        } @else {
        <div
            class="header-container left"
            (mouseenter)="expand()"
            (mouseleave)="collapse()"
        >
            <div class="content-wrapper">
                <a mat-button routerLink="/login">
                    <mat-icon>login</mat-icon>
                    <span>Log In</span>
                </a>
            </div>
        </div>
        }
        <div
            class="header-container right"
            [@rightExpandCollapse]="isExpanded() ? 'expanded' : 'collapsed'"
            (mouseenter)="expand()"
            (mouseleave)="collapse()"
        >
            <div class="content-wrapper">
                <div>
                    <b>{{ projectName() }}</b> &nbsp;
                    <span>{{ version }} </span>
                </div>
            </div>
        </div>
    `,
    styles: [
        `
            .left {
                left: 16px;
            }

            .right {
                right: 16px;
            }

            .header-container {
                background-color: #d7e3ff;
                border-radius: 8px;
                position: fixed;
                top: 16px;
                height: 48px;
                overflow: hidden;
                z-index: 100;
            }

            .content-wrapper {
                display: flex;
                align-items: center;
                height: 100%;
                padding: 0 12px;
                white-space: nowrap;
            }

            .buttons-section {
                display: flex;
            }
        `,
    ],
    animations: [
        trigger('leftExpandCollapse', [
            state(
                'collapsed',
                style({
                    width: '48px',
                })
            ),
            state(
                'expanded',
                style({
                    width: '370px',
                })
            ),
            transition('collapsed <=> expanded', [animate('0.3s ease-in-out')]),
        ]),
        trigger('rightExpandCollapse', [
            state(
                'collapsed',
                style({
                    width: '148px',
                })
            ),
            state(
                'expanded',
                style({
                    width: '200px',
                })
            ),
            transition('collapsed <=> expanded', [animate('0.3s ease-in-out')]),
        ]),
    ],
})
export class Header {
    private readonly _supabaseService = inject(SupabaseService);
    session = computed<Session | null>(() => this._supabaseService.session());

    projectName = signal<string>('Classroom Board');
    isExpanded = signal<boolean>(false);

    readonly version: string = 'v1.1.4';

    expand(): void {
        this.isExpanded.set(true);
    }

    collapse(): void {
        this.isExpanded.set(false);
    }

    openHelpPage(): void {}

    async signOut(): Promise<void> {
        await this._supabaseService.signOut();
    }
}
