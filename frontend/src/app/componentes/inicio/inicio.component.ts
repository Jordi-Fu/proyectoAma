import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent implements OnInit {
    isMenuOpen = false;
    currentUser: any = null;

    constructor(
        private router: Router,
        private authService: AuthService
    ) {}

    ngOnInit() {
        // Suscribirse al usuario actual
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
        });
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
