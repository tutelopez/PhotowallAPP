import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { NavbarComponent } from './layout/navbar/navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    @if (showNavbar()) {
      <app-navbar />
    }
    <main [class.main--bare]="!showNavbar()">
      <router-outlet />
    </main>
  `,
  styles: [`
    main {
      min-height: 100vh;
    }
    /* Sin navbar (ej. proyección): que la página ocupe todo, sin el
       padding-top que normalmente compensa la barra fija de arriba */
    main.main--bare {
      min-height: 100vh;
      padding: 0;
    }
  `]
})
export class AppComponent {
  private router = inject(Router);

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  // Rutas de pantalla completa, sin navbar ni chrome de la app
  private readonly bareRoutes = ['/projection', '/e/'];

  showNavbar = computed(() =>
    !this.bareRoutes.some(prefix => this.currentUrl().startsWith(prefix))
  );
}
