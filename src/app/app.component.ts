import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Header } from './core/layout/header.component';

@Component({
    selector: 'app-root',
    imports: [Header, RouterModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
    ngOnInit(): void {}
}
