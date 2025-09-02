import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: number;
  nombre: string;
  ruta: string;
  apellidos: string;
}

export interface LoginRequest {
  nombre: string;
  contraseña: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3001/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Verificar si hay un token guardado al iniciar el servicio
    this.checkStoredToken();
  }

  private checkStoredToken() {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.getToken();
      const userData = this.getUserData();
      
      if (token && userData) {
        // Verificar que el token sigue siendo válido
        this.verifyToken().subscribe({
          next: (response: any) => {
            this.currentUserSubject.next(response.user);
          },
          error: (error) => {
            console.log('Token inválido detectado, limpiando localStorage...', error);
            // Token inválido, limpiar almacenamiento
            this.logout();
          }
        });
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response: LoginResponse) => {
          // Guardar token y datos de usuario
          this.setToken(response.token);
          this.setUserData(response.user);
          this.currentUserSubject.next(response.user);
        }),
        catchError(error => {
          console.error('Error en login:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Limpiar almacenamiento local
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
    
    // Limpiar estado actual
    this.currentUserSubject.next(null);
  }

  verifyToken(): Observable<any> {
    const token = this.getToken();
    
    if (!token) {
      return throwError(() => new Error('No token found'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}/verify`, { headers })
      .pipe(
        catchError(error => {
          console.error('Error verificando token:', error);
          return throwError(() => error);
        })
      );
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const userData = this.getUserData();
    return !!(token && userData);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_token', token);
    }
  }

  private getUserData(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  private setUserData(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user_data', JSON.stringify(user));
    }
  }

  // Método para obtener headers con autorización
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
