
import { Component, signal, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ParteDeRespuestaDeAlarmaService, DatosParteAlarma, DatosDocumento } from '../../servicios/parte-de-respuesta-de-alarma.service';

@Component({
  selector: 'app-parte-de-respuesta-de-alarma',
  imports: [FormsModule, CommonModule],
  templateUrl: './parte-de-respuesta-de-alarma.component.html',
  styleUrls: ['./parte-de-respuesta-de-alarma.component.scss']
})
export class ParteDeRespuestaDeAlarmaComponent implements OnDestroy {
  protected readonly title = signal('frontend');
  
  // Estado del componente
  cargando = false;
  error = '';
  mensaje = '';
  mostrarFormulario = false;
  
  // Datos del formulario de Parte de Alarma
  datosParteAlarma: DatosParteAlarma;
  
  // Datos para el formulario personalizado (legacy)
  datosPersonalizados: DatosDocumento;

  constructor(
    private parteDeRespuestaService: ParteDeRespuestaDeAlarmaService,
    private router: Router
  ) {
    // Inicializar datos usando el servicio
    this.datosParteAlarma = this.parteDeRespuestaService.crearDatosParteAlarmaVacios();
    this.datosPersonalizados = this.parteDeRespuestaService.crearDatosDocumentoVacios();
  }

  /**
   * Generar PDF del Parte de Respuesta de Alarma
   */
  async generarPDFParteAlarma(): Promise<void> {
    this.iniciarCarga();
    
    try {
      console.log('Generando PDF del Parte de Respuesta de Alarma...');
      console.log('Datos a enviar:', this.datosParteAlarma);
      
      const response = await this.parteDeRespuestaService.generarPDFParteAlarma(this.datosParteAlarma).toPromise();

      if (response) {
        const nombreArchivo = this.parteDeRespuestaService.generarNombreArchivoConFecha('parte_alarma');
        this.parteDeRespuestaService.descargarArchivo(response, nombreArchivo);
        this.mostrarMensaje('PDF del Parte de Respuesta de Alarma generado y descargado exitosamente');
      }
      
    } catch (error) {
      console.error('Error al generar PDF del Parte de Alarma:', error);
      this.mostrarError('Error al generar el PDF del Parte de Alarma. Verifique que el servidor esté funcionando.');
    } finally {
      this.finalizarCarga();
    }
  }

  /**
   * Generar PDF de ejemplo del Parte de Respuesta de Alarma
   */
  async generarPDFParteAlarmaEjemplo(): Promise<void> {
    this.iniciarCarga();
    
    try {
      console.log('Generando PDF de ejemplo del Parte de Respuesta de Alarma...');
      
      const response = await this.parteDeRespuestaService.generarPDFParteAlarmaEjemplo().toPromise();

      if (response) {
        this.parteDeRespuestaService.descargarArchivo(response, 'parte_alarma_ejemplo.pdf');
        this.mostrarMensaje('PDF de ejemplo del Parte de Alarma generado y descargado exitosamente');
      }
      
    } catch (error) {
      console.error('Error al generar PDF de ejemplo:', error);
      this.mostrarError('Error al generar el PDF de ejemplo. Verifique que el servidor esté funcionando.');
    } finally {
      this.finalizarCarga();
    }
  }

  /**
   * Volver a la página principal
   */
  volver(){
    this.router.navigate(['/']);
  }

  /**
   * Generar documento con datos de ejemplo (legacy)
   */
  async generarDocumentoEjemplo(): Promise<void> {
    this.iniciarCarga();
    
    try {
      console.log('Generando documento con datos de ejemplo...');
      
      const response = await this.parteDeRespuestaService.generarDocumentoEjemplo().toPromise();

      if (response) {
        this.parteDeRespuestaService.descargarArchivo(response, 'documento_ejemplo.pdf');
        this.mostrarMensaje('Documento PDF generado y descargado exitosamente');
      }
      
    } catch (error) {
      console.error('Error al generar documento:', error);
      this.mostrarError('Error al generar el documento. Verifique que el servidor esté funcionando.');
    } finally {
      this.finalizarCarga();
    }
  }

  /**
   * Manejar selección de imágenes para el parte de alarma
   */
  onImagenesAlarmaSeleccionadas(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // Inicializar el array si no existe
      if (!this.datosParteAlarma.imagenes) {
        this.datosParteAlarma.imagenes = [];
      }
      
      // Agregar las nuevas imágenes a las existentes
      const nuevasImagenes = Array.from(input.files);
      this.datosParteAlarma.imagenes.push(...nuevasImagenes);
      
      console.log('Imágenes del parte de alarma seleccionadas:', this.datosParteAlarma.imagenes?.map(f => f.name));
      console.log('Total de imágenes:', this.datosParteAlarma.imagenes?.length);
      
      // Limpiar el input para permitir seleccionar las mismas imágenes nuevamente si es necesario
      input.value = '';
    }
  }

  /**
   * Eliminar imagen del parte de alarma
   */
  eliminarImagenAlarma(index: number): void {
    if (this.datosParteAlarma.imagenes) {
      this.datosParteAlarma.imagenes.splice(index, 1);
    }
  }

  /**
   * TrackBy function para mejorar el rendimiento del *ngFor
   */
  trackByIndex(index: number, item: File): number {
    return index;
  }

  /**
   * Manejar errores de carga de imágenes
   */
  onImageError(event: any): void {
    console.error('Error al cargar imagen:', event);
    event.target.style.display = 'none';
  }

  /**
   * Obtener URL de imagen para preview
   */
  getImagePreview(file: File): string {
    return this.parteDeRespuestaService.getImagePreview(file);
  }

  /**
   * Limpiar URLs de objetos cuando el componente se destruye
   */
  ngOnDestroy(): void {
    // Limpiar URLs de objetos para evitar memory leaks
    this.parteDeRespuestaService.limpiarImagenesMemoria(this.datosParteAlarma.imagenes || []);
    this.parteDeRespuestaService.limpiarImagenesMemoria(this.datosPersonalizados.imagenes || []);
  }

  /**
   * Manejar selección de imágenes
   */
  onImagenesSeleccionadas(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.datosPersonalizados.imagenes = Array.from(input.files);
      console.log('Imágenes seleccionadas:', this.datosPersonalizados.imagenes?.map(f => f.name));
    }
  }

  /**
   * Eliminar imagen seleccionada
   */
  eliminarImagen(index: number): void {
    if (this.datosPersonalizados.imagenes) {
      this.datosPersonalizados.imagenes.splice(index, 1);
    }
  }

  /**
   * Generar documento con datos personalizados
   */
  async generarDocumentoPersonalizado(): Promise<void> {
    this.iniciarCarga();
    
    try {
      console.log('Generando documento con datos personalizados:', this.datosPersonalizados);
      
      const response = await this.parteDeRespuestaService.generarDocumentoPersonalizado(this.datosPersonalizados).toPromise();

      if (response) {
        const nombreArchivo = `documento_${this.datosPersonalizados.nombre || 'personalizado'}.pdf`;
        this.parteDeRespuestaService.descargarArchivo(response, nombreArchivo);
        this.mostrarMensaje('Documento PDF generado y descargado exitosamente');
      }
      
    } catch (error) {
      console.error('Error al generar documento personalizado:', error);
      this.mostrarError('Error al generar el documento personalizado. Verifique los datos y que el servidor esté funcionando.');
    } finally {
      this.finalizarCarga();
    }
  }

  /**
   * Filtrar datos vacíos del objeto
   */
  private filtrarDatosVacios(datos: DatosDocumento): DatosDocumento {
    const datosLimpios: DatosDocumento = {};
    
    Object.entries(datos).forEach(([key, value]) => {
      if (value && value.toString().trim() !== '') {
        (datosLimpios as any)[key] = value;
      }
    });
    
    return datosLimpios;
  }

  /**
   * Verificar plantilla Word en el backend
   */
  async verificarPlantilla(): Promise<void> {
    this.iniciarCarga();
    
    try {
      console.log('Verificando plantilla Word...');
      
      const response = await this.parteDeRespuestaService.verificarPlantilla().toPromise();
      
      console.log('Respuesta de verificación:', response);
      this.mostrarMensaje('Verificación completada. Revisa la consola del navegador y del servidor para los detalles.');
      
    } catch (error) {
      console.error('Error al verificar plantilla:', error);
      this.mostrarError('Error al verificar la plantilla. Verifique que el servidor esté funcionando.');
    } finally {
      this.finalizarCarga();
    }
  }

  /**
   * Descargar archivo blob
   */
  private descargarArchivo(blob: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Métodos auxiliares para manejo de estado
   */
  private iniciarCarga(): void {
    this.cargando = true;
    this.error = '';
    this.mensaje = '';
  }

  private finalizarCarga(): void {
    this.cargando = false;
  }

  private mostrarError(mensaje: string): void {
    this.error = mensaje;
    this.mensaje = '';
    // Limpiar error después de 5 segundos
    setTimeout(() => {
      this.error = '';
    }, 5000);
  }

  private mostrarMensaje(mensaje: string): void {
    this.mensaje = mensaje;
    this.error = '';
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => {
      this.mensaje = '';
    }, 3000);
  }
}
