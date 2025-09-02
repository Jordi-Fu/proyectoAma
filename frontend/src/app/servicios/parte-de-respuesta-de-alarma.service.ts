import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DatosParteAlarma {
  // Datos básicos
  zonas?: string;
  fecha?: string;
  cliente?: string;
  abonado?: string;
  direccion?: string;
  poblacion?: string;
  
  // Motivo aviso
  intrusion?: boolean;
  incendio?: boolean;
  otro?: boolean;
  otroTexto?: string;
  
  // Horarios
  horaAviso?: string;
  horaLlegadaInstalacion?: string;
  horaFin?: string;
  
  // Situación
  sirena?: boolean;
  personalFfcc?: boolean;
  zona?: boolean;
  hayPersonal?: boolean;
  signosViolencia?: boolean;
  contratas?: boolean;
  puertasAbiertas?: boolean;
  personasAjenas?: boolean;
  ventanasAbiertas?: boolean;
  humoIncendio?: boolean;
  lucesEncendidas?: boolean;
  otrosSituacion?: boolean;
  
  // Actuación
  verificacionPerimetral?: boolean;
  tecladoCentralita?: boolean;
  accesoRecinto?: boolean;
  seResetea?: boolean;
  personaEmpresa?: boolean;
  anulanZonas?: boolean;
  llamadaA?: boolean;
  llamadaTexto?: string;
  silencia?: boolean;
  abreInstalacion?: boolean;
  abreTexto?: string;
  desconectaAlarma?: boolean;
  cierraInstalacion?: boolean;
  conectaAlarma?: boolean;
  personaIdentificada?: boolean;
  otrasActuacion?: boolean;
  otrasTexto?: string;
  nieDniPersona?: boolean;
  nieDniTexto?: string;
  pruebasGraficas?: boolean;
  
  // Final
  alarmaConfirmada?: 'si' | 'no';
  observaciones?: string;
  imagenes?: File[];
  firmaVigilante?: string;
  tip?: string;
}

export interface DatosDocumento {
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

@Injectable({
  providedIn: 'root'
})
export class ParteDeRespuestaDeAlarmaService {
  private readonly apiUrl = 'http://localhost:3001/api';

  constructor(private http: HttpClient) {}

  /**
   * Generar PDF del Parte de Respuesta de Alarma
   */
  generarPDFParteAlarma(datos: DatosParteAlarma): Observable<Blob> {
    // Verificar si hay imágenes para enviar
    if (datos.imagenes && datos.imagenes.length > 0) {
      // Crear FormData para enviar archivos e información
      const formData = new FormData();
      
      // Crear una copia de los datos sin las imágenes para enviar como JSON
      const datosParaEnviar = { ...datos };
      delete datosParaEnviar.imagenes;
      
      // Agregar datos como JSON string
      formData.append('datos', JSON.stringify(datosParaEnviar));
      
      // Agregar cada imagen al FormData
      datos.imagenes.forEach((imagen, index) => {
        formData.append('imagenes', imagen, imagen.name);
      });
      
      return this.http.post(`${this.apiUrl}/documentos/pdf/parte-alarma`, formData, {
        responseType: 'blob'
      });
    } else {
      // Enviar como JSON normal si no hay imágenes
      return this.http.post(`${this.apiUrl}/documentos/pdf/parte-alarma`, datos, {
        responseType: 'blob'
      });
    }
  }

  /**
   * Generar PDF de ejemplo del Parte de Respuesta de Alarma
   */
  generarPDFParteAlarmaEjemplo(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/documentos/pdf/parte-alarma/ejemplo`, {
      responseType: 'blob'
    });
  }

  /**
   * Generar documento con datos de ejemplo (legacy)
   */
  generarDocumentoEjemplo(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/documentos/pdf/ejemplo`, {
      responseType: 'blob'
    });
  }

  /**
   * Generar documento con datos personalizados
   */
  generarDocumentoPersonalizado(datos: DatosDocumento): Observable<Blob> {
    // Crear FormData para enviar archivos e información
    const formData = new FormData();
    
    // Filtrar datos de texto (sin imágenes)
    const datosTexto = this.filtrarDatosVacios(
      Object.fromEntries(
        Object.entries(datos)
          .filter(([key]) => key !== 'imagenes')
      )
    );
    
    // Agregar datos de texto
    formData.append('datos', JSON.stringify(datosTexto));
    
    // Agregar imágenes si existen
    if (datos.imagenes && datos.imagenes.length > 0) {
      datos.imagenes.forEach((imagen, index) => {
        formData.append(`imagenes`, imagen);
      });
    }
    
    return this.http.post(`${this.apiUrl}/documentos/pdf`, formData, {
      responseType: 'blob'
    });
  }

  /**
   * Verificar plantilla Word en el backend
   */
  verificarPlantilla(): Observable<any> {
    return this.http.get(`${this.apiUrl}/documentos/verificar-plantilla`);
  }

  /**
   * Crear datos iniciales para el parte de alarma
   */
  crearDatosParteAlarmaVacios(): DatosParteAlarma {
    return {
      zonas: '',
      fecha: '',
      cliente: '',
      abonado: '',
      direccion: '',
      poblacion: '',
      intrusion: false,
      incendio: false,
      otro: false,
      otroTexto: '',
      horaAviso: '',
      horaLlegadaInstalacion: '',
      horaFin: '',
      sirena: false,
      personalFfcc: false,
      zona: false,
      hayPersonal: false,
      signosViolencia: false,
      contratas: false,
      puertasAbiertas: false,
      personasAjenas: false,
      ventanasAbiertas: false,
      humoIncendio: false,
      lucesEncendidas: false,
      otrosSituacion: false,
      verificacionPerimetral: false,
      tecladoCentralita: false,
      accesoRecinto: false,
      seResetea: false,
      personaEmpresa: false,
      anulanZonas: false,
      llamadaA: false,
      llamadaTexto: '',
      silencia: false,
      abreInstalacion: false,
      abreTexto: '',
      desconectaAlarma: false,
      cierraInstalacion: false,
      conectaAlarma: false,
      personaIdentificada: false,
      otrasActuacion: false,
      otrasTexto: '',
      nieDniPersona: false,
      nieDniTexto: '',
      pruebasGraficas: false,
      alarmaConfirmada: undefined,
      observaciones: '',
      imagenes: [],
      firmaVigilante: '',
      tip: ''
    };
  }

  /**
   * Crear datos iniciales para documento personalizado
   */
  crearDatosDocumentoVacios(): DatosDocumento {
    return {
      nombre: '',
      apellidos: '',
      email: '',
      telefono: '',
      direccion: '',
      empresa: '',
      cargo: '',
      imagenes: []
    };
  }

  /**
   * Descargar archivo blob
   */
  descargarArchivo(blob: Blob, nombreArchivo: string): void {
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
   * Generar nombre de archivo con fecha
   */
  generarNombreArchivoConFecha(prefijo: string, extension: string = 'pdf'): string {
    const fecha = new Date().toISOString().split('T')[0];
    return `${prefijo}_${fecha}.${extension}`;
  }

  /**
   * Obtener URL de imagen para preview
   */
  getImagePreview(file: File): string {
    if (file) {
      return URL.createObjectURL(file);
    }
    return '';
  }

  /**
   * Limpiar URLs de objetos para evitar memory leaks
   */
  limpiarImagenesMemoria(imagenes: File[]): void {
    if (imagenes) {
      imagenes.forEach(imagen => {
        const url = URL.createObjectURL(imagen);
        URL.revokeObjectURL(url);
      });
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
}
