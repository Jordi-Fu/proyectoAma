import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, User } from '../../servicios/auth.service';
import { CommonModule } from '@angular/common';
import { ListaDocumentosComponent } from '../lista-documentos/lista-documentos.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, RouterLinkActive, CommonModule, ListaDocumentosComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent implements OnInit {
    isMenuOpen = false;
    currentUser$: Observable<User | null>;

    constructor(
        private router: Router,
        private authService: AuthService
    ) {
        this.currentUser$ = this.authService.currentUser$;
    }

    ngOnInit() {
        // No necesitamos suscribirnos manualmente, usaremos el pipe async en el template
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }

    closeMenu() {
        this.isMenuOpen = false;
    }

    irParteAlarma(){
        // Navegar a la parte de respuesta de alarma
        this.router.navigate(['/parteRespuestaAlarma']);
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    isAuthenticated(): boolean {
        return this.authService.isAuthenticated();
    }
}
