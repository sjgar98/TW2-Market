import { Component, signal } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { MenuLateral } from './layout/menu-lateral/menu-lateral';

@Component({
  imports: [Header, MatSidenavModule, MenuLateral, RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  protected readonly menuAbierto = signal(false);
}
