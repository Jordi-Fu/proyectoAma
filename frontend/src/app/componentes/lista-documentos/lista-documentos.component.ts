import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentosService, Documento, ListaDocumentosResponse } from '../../servicios/documentos.service';
import { AuthService } from '../../servicios/auth.service';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-lista-documentos',
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-documentos.component.html',
  styleUrl: './lista-documentos.component.scss'
})
export class ListaDocumentosComponent implements OnInit, OnDestroy {
  documentos: Documento[] = [];
  paginaActual = 1;
  totalPaginas = 1;
  totalDocumentos = 0;
  documentosPorPagina = 10;
  busqueda = '';
  cargando = false;
  error = '';

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private documentosService: DocumentosService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Configurar búsqueda con debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.busqueda = searchTerm;
      this.paginaActual = 1;
      this.cargarDocumentos();
    });
  }

  ngOnInit() {
    // Verificar autenticación antes de cargar documentos
    if (!this.authService.isAuthenticated()) {
      console.log('❌ Usuario no autenticado, redirigiendo al login');
      this.router.navigate(['/login']);
      return;
    }

    this.cargarDocumentos();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarDocumentos() {
    // Verificar autenticación antes de hacer la petición
    if (!this.authService.isAuthenticated()) {
      console.log('Usuario no autenticado, redirigiendo...');
      this.router.navigate(['/login']);
      return;
    }

    this.cargando = true;
    this.error = '';

    this.documentosService.obtenerDocumentos(this.paginaActual, this.documentosPorPagina, this.busqueda)
      .subscribe({
        next: (response: ListaDocumentosResponse) => {
          this.documentos = response.documentos || [];
          this.totalPaginas = response.totalPaginas || 0;
          this.totalDocumentos = response.total || 0;
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error cargando documentos:', error);
          
          if (error.status === 401) {
            this.error = 'Sesión expirada. Por favor, inicie sesión nuevamente.';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else if (error.message?.includes('Timeout')) {
            this.error = 'El servidor tardó demasiado en responder. Intente nuevamente.';
          } else if (error.status === 0) {
            this.error = 'No se puede conectar con el servidor. Verifique su conexión.';
          } else {
            this.error = 'Error al cargar los documentos. Intente nuevamente.';
          }
          
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
  }

  onBusquedaChange(termino: string) {
    this.searchSubject.next(termino);
  }

  irAPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.cargarDocumentos();
    }
  }

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.irAPagina(this.paginaActual - 1);
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.irAPagina(this.paginaActual + 1);
    }
  }

  visualizarDocumento(documento: Documento) {
    this.documentosService.abrirDocumentoEnNuevaVentana(documento.nombre);
  }

  descargarDocumento(documento: Documento) {
    this.documentosService.iniciarDescarga(documento.nombre);
  }

  // Método para formatear el tamaño de archivo
  formatearTamano(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Método para formatear fecha
  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Generar array de páginas para mostrar en la paginación
  get paginasVisibles(): number[] {
    const paginas: number[] = [];
    const inicio = Math.max(1, this.paginaActual - 2);
    const fin = Math.min(this.totalPaginas, this.paginaActual + 2);
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }

  // Función para el trackBy de Angular
  trackByNombre(index: number, documento: Documento): string {
    return documento.nombre;
  }

  // Método para obtener el último elemento de la página actual
  getUltimoElemento(): number {
    return Math.min(this.paginaActual * this.documentosPorPagina, this.totalDocumentos);
  }
}
