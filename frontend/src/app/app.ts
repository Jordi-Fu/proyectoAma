import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DatosDocumento {
  nombre?: string;
  apellidos?: string;
  edad?: number;
  email?: string;
  telefono?: string;
  direccion?: string;
  empresa?: string;
  cargo?: string;
  salario?: number;
  imagenes?: File[];
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HttpClientModule, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
  
  // Estado del componente
  cargando = false;
  error = '';
  mensaje = '';
  mostrarFormulario = false;
  
  // URL base de la API
  private readonly apiUrl = 'http://localhost:3001/api';
  
  // Datos para el formulario personalizado
  datosPersonalizados: DatosDocumento = {
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    empresa: '',
    cargo: '',
    imagenes: []
  };

  constructor(private http: HttpClient) {}

  /**
   * Generar documento con datos de ejemplo
   */
  async generarDocumentoEjemplo(): Promise<void> {
    this.iniciarCarga();
    
    try {
      console.log('Generando documento con datos de ejemplo...');
      
      const response = await this.http.get(`${this.apiUrl}/documentos/pdf/ejemplo`, {
        responseType: 'blob'
      }).toPromise();

      if (response) {
        this.descargarArchivo(response, 'documento_ejemplo.pdf');
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
      
      // Crear FormData para enviar archivos e información
      const formData = new FormData();
      
      // Filtrar datos de texto (sin imágenes)
      const datosTexto = this.filtrarDatosVacios(
        Object.fromEntries(
          Object.entries(this.datosPersonalizados)
            .filter(([key]) => key !== 'imagenes')
        )
      );
      
      // Agregar datos de texto
      formData.append('datos', JSON.stringify(datosTexto));
      
      // Agregar imágenes si existen
      if (this.datosPersonalizados.imagenes && this.datosPersonalizados.imagenes.length > 0) {
        this.datosPersonalizados.imagenes.forEach((imagen, index) => {
          formData.append(`imagenes`, imagen);
        });
      }
      
      const response = await this.http.post(`${this.apiUrl}/documentos/pdf`, formData, {
        responseType: 'blob'
      }).toPromise();

      if (response) {
        const nombreArchivo = `documento_${datosTexto.nombre || 'personalizado'}.pdf`;
        this.descargarArchivo(response, nombreArchivo);
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
      
      const response = await this.http.get(`${this.apiUrl}/documentos/verificar-plantilla`).toPromise();
      
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
