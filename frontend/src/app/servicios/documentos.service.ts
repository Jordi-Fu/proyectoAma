import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, timeout } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

export interface Documento {
  nombre: string;
  ruta: string;
  fechaCreacion: Date;
  tamano: number;
}

export interface ListaDocumentosResponse {
  documentos: Documento[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentosService {
  private apiUrl = 'http://localhost:3001/api/documentos';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  private handleAuthError = (error: any) => {
    if (error.status === 401) {
      // Token inválido, limpiar localStorage y redirigir al login
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
      this.router.navigate(['/login']);
    }
    return throwError(() => error);
  };

  private getAuthHeaders(): HttpHeaders {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('auth_token');
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders();
  }

  // Obtener lista de documentos del usuario
  obtenerDocumentos(pagina: number = 1, limite: number = 10, busqueda: string = ''): Observable<ListaDocumentosResponse> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());

    if (busqueda.trim() !== '') {
      params = params.set('busqueda', busqueda);
    }

    const headers = this.getAuthHeaders();

    return this.http.get<ListaDocumentosResponse>(`${this.apiUrl}/lista`, { headers, params })
      .pipe(
        timeout(10000), // Timeout de 10 segundos
        catchError(error => {
          console.error('Error obteniendo documentos:', error);
          
          if (error.name === 'TimeoutError') {
            return throwError(() => new Error('Timeout: El servidor tardó demasiado en responder'));
          }
          
          if (error.status === 401) {
            return this.handleAuthError(error);
          }
          return throwError(() => error);
        })
      );
  }

  // Visualizar documento (obtener URL para visualización)
  visualizarDocumento(nombreArchivo: string): Observable<Blob> {
    const headers = this.getAuthHeaders();
    
    return this.http.get(`${this.apiUrl}/visualizar/${nombreArchivo}`, { 
      headers, 
      responseType: 'blob' 
    })
    .pipe(
      catchError(error => {
        console.error('Error visualizando documento:', error);
        return throwError(() => error);
      })
    );
  }

  // Descargar documento
  descargarDocumento(nombreArchivo: string): Observable<Blob> {
    const headers = this.getAuthHeaders();
    
    return this.http.get(`${this.apiUrl}/descargar/${nombreArchivo}`, { 
      headers, 
      responseType: 'blob' 
    })
    .pipe(
      catchError(error => {
        console.error('Error descargando documento:', error);
        return throwError(() => error);
      })
    );
  }

  // Método para abrir documento en nueva ventana
  abrirDocumentoEnNuevaVentana(nombreArchivo: string): void {
    this.visualizarDocumento(nombreArchivo).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const nuevaVentana = window.open(url, '_blank');
        if (!nuevaVentana) {
          alert('No se pudo abrir la ventana. Verifique que no esté bloqueada por el navegador.');
        }
      },
      error: (error) => {
        console.error('Error al abrir documento:', error);
        alert('Error al abrir el documento');
      }
    });
  }

  // Método para descargar documento
  iniciarDescarga(nombreArchivo: string): void {
    this.descargarDocumento(nombreArchivo).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nombreArchivo;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error al descargar documento:', error);
        alert('Error al descargar el documento');
      }
    });
  }
}
