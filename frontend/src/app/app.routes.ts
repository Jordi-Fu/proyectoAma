import { Routes } from '@angular/router';
// Import components
import { ParteDeRespuestaDeAlarmaComponent } from "./componentes/parte-de-respuesta-de-alarma.component/parte-de-respuesta-de-alarma.component";
import { InicioComponent } from "./componentes/inicio/inicio.component";
import { LoginComponent } from "./componentes/login/login";
import { AuthGuard } from "./servicios/auth.guard";

export const routes: Routes = [
    { path: "", component: LoginComponent }, // Login como página principal
    { path: 'inicio', component: InicioComponent, canActivate: [AuthGuard] }, // Protegido con AuthGuard
    { path: 'login', component: LoginComponent },
    { path: 'parteRespuestaAlarma', component: ParteDeRespuestaDeAlarmaComponent, canActivate: [AuthGuard] }, // También protegido
    { path: '**', redirectTo: '' } // Si la URL no existe, redirige a la raíz (login)
];

