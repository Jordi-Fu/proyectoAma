import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';

// Interfaz para los datos del parte de respuesta de alarma
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
  imagenes?: string[]; // Array de imágenes en base64
  firmaVigilante?: string;
  tip?: string;
}

/**
 * Función para generar PDF del parte de respuesta de alarma
 */
export const generarPDFParteAlarma = async (datos: DatosParteAlarma): Promise<Buffer> => {
  try {
    console.log('=== INICIO DE GENERACIÓN PDF PARTE DE ALARMA ===');
    console.log('Procesando PDF con datos:', datos);

    // Agregar fecha actual si no se proporciona
    if (!datos.fecha) {
      datos.fecha = new Date().toLocaleDateString('es-ES');
    }

    // Generar HTML para el PDF
    const htmlContent = generarHTMLParteAlarma(datos);

    // Lanzar Puppeteer para generar PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Configurar el contenido HTML
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Generar el PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '5mm',
        right: '5mm',
        bottom: '5mm',
        left: '5mm'
      },
      preferCSSPageSize: true,
      displayHeaderFooter: false
    });

    await browser.close();

    console.log('✅ PDF Parte de Alarma generado exitosamente, tamaño:', pdfBuffer.length, 'bytes');
    console.log('=== GENERACIÓN PDF PARTE DE ALARMA COMPLETADA ===');

    return Buffer.from(pdfBuffer);

  } catch (error) {
    console.error('Error al generar PDF Parte de Alarma:', error);
    throw new Error(`Error al generar el PDF del Parte de Alarma: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

/**
 * Generar contenido HTML para el PDF del Parte de Respuesta de Alarma
 */
function generarHTMLParteAlarma(datos: DatosParteAlarma): string {
  console.log('🔄 Generando contenido HTML del Parte de Alarma...');

  const html = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Parte de Respuesta de Alarma</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: Arial, sans-serif;
        font-size: 9px;
        line-height: 1.1;
        color: #000;
        background-color: #fff;
        margin: 0;
        padding: 0;
      }
      
      .container {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        padding: 5px;
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 2px solid #000;
        padding: 5px;
        margin-bottom: 8px;
        font-weight: bold;
      }
      
      .logo-left {
        font-size: 12px;
        font-weight: bold;
        width: 50px;
      }
      
      .title {
        flex: 1;
        text-align: center;
        font-size: 11px;
        line-height: 1.1;
      }
      
      .logo-right {
        font-size: 16px;
        width: 50px;
        text-align: center;
      }
      
      .form-row {
        display: flex;
        margin-bottom: 3px;
        align-items: stretch;
      }
      
      .form-field {
        border: 1px solid #000;
        padding: 3px;
        margin-right: 3px;
        font-weight: bold;
        position: relative;
        font-size: 8px;
      }
      
      .form-field:last-child {
        margin-right: 0;
      }
      
      .form-field input {
        border: none;
        outline: none;
        background: transparent;
        font-family: inherit;
        font-size: inherit;
        margin-left: 5px;
        font-weight: normal;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }
      
      .checkbox-row {
        border: 1px solid #000;
        padding: 3px;
        margin-bottom: 3px;
        font-weight: bold;
        font-size: 8px;
      }
      
      .checkbox-inline {
        margin-right: 15px;
      }
      
      .checkbox {
        width: 10px;
        height: 10px;
        border: 1px solid #000;
        display: inline-block;
        margin-right: 3px;
        text-align: center;
        line-height: 8px;
        font-weight: bold;
        font-size: 7px;
      }
      
      .checkbox.checked::after {
        content: '✓';
      }
      
      .section-title {
        background: #f0f0f0;
        border: 1px solid #000;
        padding: 3px;
        font-weight: bold;
        text-align: center;
        margin: 5px 0 3px 0;
        font-size: 8px;
      }
      
      .section-title-2 {
        background: #e0e0e0;
        border: 1px solid #000;
        padding: 3px;
        font-weight: bold;
        text-align: center;
        margin: 5px 0 3px 0;
        font-size: 8px;
      }
      
      .checkbox-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2px;
        margin-bottom: 5px;
      }
      
      .checkbox-item {
        border: 1px solid #000;
        padding: 2px;
        display: flex;
        align-items: center;
        font-size: 7px;
      }
      
      .action-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2px;
        margin-bottom: 5px;
      }
      
      .action-item {
        border: 1px solid #000;
        padding: 2px;
        display: flex;
        align-items: center;
        font-size: 7px;
      }
      
      .final-section {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }
      
      .final-section > div {
        border: 1px solid #000;
        padding: 3px;
        flex: 1;
        margin-right: 5px;
        font-weight: bold;
        font-size: 8px;
      }
      
      .final-section > div:last-child {
        margin-right: 0;
      }
      
      .observations-section {
        border: 1px solid #000;
        margin-bottom: 5px;
        page-break-inside: avoid;
      }
      
      .observations-section > strong {
        display: block;
        background: #f0f0f0;
        padding: 3px;
        border-bottom: 1px solid #000;
        font-size: 8px;
      }
      
      .observations {
        padding: 5px;
        min-height: 40px;
        line-height: 1.2;
        word-wrap: break-word;
        word-break: break-word;
        white-space: pre-wrap;
        overflow-wrap: break-word;
        hyphens: auto;
        font-size: 7px;
      }
      
      .signature-section {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }
      
      .signature-box {
        border: 1px solid #000;
        padding: 3px;
        width: 48%;
        text-align: center;
        font-weight: bold;
        min-height: 30px;
        font-size: 8px;
      }
      
      .signature-input {
        margin-top: 10px;
        border-top: 1px solid #000;
        padding-top: 3px;
        font-weight: normal;
        font-size: 7px;
      }
      
      .footer {
        text-align: center;
        border: 1px solid #000;
        padding: 3px;
        font-weight: bold;
        background: #f9f9f9;
        font-size: 7px;
      }
      
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .container { margin: 0; padding: 5px; }
      }
      
      .w-35 { width: 35%; }
      .w-25 { width: 25%; }
      .w-40 { width: 40%; }
      .w-50 { width: 50%; }
      .w-100 { width: 100%; }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="logo-left">FBS</div>
        <div class="title">
          SERVICIO DE ACUDA<br>
          PARTE DE RESPUESTA DE ALARMA
        </div>
        <div class="logo-right">🏢</div>
      </div>
      
      <!-- Datos básicos -->
      <div class="form-row">
        <div class="form-field w-35">
          ZONA(S): <span style="font-weight: normal;">${datos.zonas || ''}</span>
        </div>
        <div class="form-field w-25">
          FECHA: <span style="font-weight: normal;">${datos.fecha || ''}</span>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-field w-35">
          CLIENTE: <span style="font-weight: normal;">${datos.cliente || ''}</span>
        </div>
        <div class="form-field w-25">
          ABONADO: <span style="font-weight: normal;">${datos.abonado || ''}</span>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-field w-50">
          DIRECCIÓN: <span style="font-weight: normal;">${datos.direccion || ''}</span>
        </div>
        <div class="form-field w-25">
          POBLACIÓN: <span style="font-weight: normal;">${datos.poblacion || ''}</span>
        </div>
      </div>
      
      <!-- Motivo aviso -->
      <div class="checkbox-row">
        MOTIVO AVISO:
        <span class="checkbox-inline">
          <span class="checkbox ${datos.intrusion ? 'checked' : ''}"></span> INTRUSIÓN
        </span>
        <span class="checkbox-inline">
          <span class="checkbox ${datos.incendio ? 'checked' : ''}"></span> INCENDIO
        </span>
        <span class="checkbox-inline">
          <span class="checkbox ${datos.otro ? 'checked' : ''}"></span> OTRO: <span style="font-weight: normal;">${datos.otroTexto || ''}</span>
        </span>
      </div>
      
      <!-- Horarios -->
      <div class="form-row">
        <div class="form-field w-35">
          HORA AVISO: <span style="font-weight: normal;">${datos.horaAviso || ''}</span>
        </div>
        <div class="form-field w-40">
          HORA LLEGADA INSTALACIÓN: <span style="font-weight: normal;">${datos.horaLlegadaInstalacion || ''}</span>
        </div>
      </div>
      
      <!-- Situación -->
      <div class="section-title">SITUACIÓN (DETALLAR EN OBSERVACIONES)</div>
      
      <div class="checkbox-grid">
        <div class="checkbox-item">
          <span class="checkbox ${datos.sirena ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">SIRENA</span>
        </div>
        <div class="checkbox-item">
          <span class="checkbox ${datos.personalFfcc ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">SE PERSONAN FF.CC.SS.</span>
        </div>
        <div class="checkbox-item">
          <span class="checkbox ${datos.zona ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">ZONA</span>
        </div>
        <div class="checkbox-item">
          <span class="checkbox ${datos.hayPersonal ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">HAY PERSONAL DE LA EMPRESA</span>
        </div>
        <div class="checkbox-item">
          <span class="checkbox ${datos.signosViolencia ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">SIGNOS VIOLENCIA</span>
        </div>
        <div class="checkbox-item">
          <span class="checkbox ${datos.contratas ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">HAY CONTRATAS</span>
        </div>
        <div class="checkbox-item">
          <span class="checkbox ${datos.puertasAbiertas ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">PUERTAS ABIERTAS</span>
        </div>
        <div class="checkbox-item">
          <span class="checkbox ${datos.personasAjenas ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">HAY PERSONAS AJENAS A LA EMPRESA</span>
        </div>
        <div class="checkbox-item">
          <span class="checkbox ${datos.ventanasAbiertas ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">VENTANAS ABIERTAS</span>
        </div>
        <div class="checkbox-item">
          <span class="checkbox ${datos.humoIncendio ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">HAY HUMO O INDICIOS DE INCENDIO</span>
        </div>
        <div class="checkbox-item">
          <span class="checkbox ${datos.lucesEncendidas ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">LUCES ENCENDIDAS</span>
        </div>
        <div class="checkbox-item">
          <span class="checkbox ${datos.otrosSituacion ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">OTROS</span>
        </div>
      </div>
      
      <!-- Actuación -->
      <div class="section-title-2">ACTUACIÓN</div>
      
      <div class="action-grid">
        <div class="action-item">
          <span class="checkbox ${datos.verificacionPerimetral ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">VERIFICACIÓN PERIMETRAL</span>
        </div>
        <div class="action-item">
          <span class="checkbox ${datos.tecladoCentralita ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">TECLADO/CENTRALITA ALARMA:</span>
        </div>
        <div class="action-item">
          <span class="checkbox ${datos.accesoRecinto ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">ACCESO AL RECINTO (VALLADO, ZONAS COMUNES)</span>
        </div>
        <div class="action-item">
          <span class="checkbox ${datos.seResetea ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">SE RESETEA (RECONECTAR/REARMAR)</span>
        </div>
        <div class="action-item">
          <span class="checkbox ${datos.personaEmpresa ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">SE PERSONA PERSONAL DE LA EMPRESA</span>
        </div>
        <div class="action-item">
          <span class="checkbox ${datos.anulanZonas ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">SE ANULAN ZONAS</span>
        </div>
        <div class="action-item">
          <span class="checkbox ${datos.llamadaA ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">SE REALIZA LLAMADA A: ${datos.llamadaTexto || ''}</span>
        </div>
        <div class="action-item">
          <span class="checkbox ${datos.silencia ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">SE SILENCIA</span>
        </div>
        <div class="action-item">
          <span class="checkbox ${datos.abreInstalacion ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">SE ABRE INSTALACIÓN A: ${datos.abreTexto || ''}</span>
        </div>
        <div class="action-item">
          <span class="checkbox ${datos.desconectaAlarma ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">SE DESCONECTA ALARMA</span>
        </div>
        <div class="action-item">
          <span class="checkbox ${datos.cierraInstalacion ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">SE CIERRA INSTALACIÓN</span>
        </div>
        <div class="action-item">
          <span class="checkbox ${datos.conectaAlarma ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">SE CONECTA ALARMA</span>
        </div>
        <div class="action-item">
          <span class="checkbox ${datos.personaIdentificada ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">PERSONA IDENTIFICADA</span>
        </div>
        <div class="action-item">
          <span class="checkbox ${datos.otrasActuacion ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">OTRAS: ${datos.otrasTexto || ''}</span>
        </div>
        <div class="action-item">
          <span class="checkbox ${datos.nieDniPersona ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">NIE/DNI PERSONA ID. ${datos.nieDniTexto || ''}</span>
        </div>
        <div class="action-item">
          <span class="checkbox ${datos.pruebasGraficas ? 'checked' : ''}"></span>
          <span style="margin-left: 5px;">PRUEBAS GRÁFICAS (FOTOS)</span>
        </div>
      </div>
      
      <!-- Alarma confirmada y hora fin -->
      <div class="final-section">
        <div>
          <strong>ALARMA CONFIRMADA:</strong>
          <span class="checkbox ${datos.alarmaConfirmada === 'si' ? 'checked' : ''}" style="margin-left: 10px;"></span> SI
          <span class="checkbox ${datos.alarmaConfirmada === 'no' ? 'checked' : ''}" style="margin-left: 15px;"></span> NO
        </div>
        <div>
          <strong>HORA FIN:</strong> <span style="font-weight: normal;">${datos.horaFin || ''}</span>
        </div>
      </div>
      
      <!-- Observaciones -->
      <div class="observations-section">
        <strong>OBSERVACIONES:</strong>
        <div class="observations">
          ${datos.observaciones ? datos.observaciones.replace(/\n/g, '<br>') : ''}
          
          ${datos.imagenes && datos.imagenes.length > 0 ? `
            <div class="images-container" style="margin-top: 8px;">
              <div style="border-top: 1px solid #ddd; padding-top: 5px; margin-top: 5px;">
                <strong style="display: block; margin-bottom: 5px; font-size: 7px;">Imágenes adjuntas:</strong>
                <div class="images-grid" style="display: flex; flex-wrap: wrap; gap: 5px;">
                  ${datos.imagenes.map((imagen, index) => `
                    <div style="border: 1px solid #ddd; padding: 2px; max-width: 80px;">
                      <img src="${imagen}" 
                           alt="Imagen ${index + 1}" 
                           style="max-width: 100%; height: auto; max-height: 60px; object-fit: cover; display: block;">
                      <div style="font-size: 6px; text-align: center; margin-top: 2px; color: #666;">
                        Img ${index + 1}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
      
      <!-- Firmas -->
      <div class="signature-section">
        <div class="signature-box">
          FIRMA VIGILANTE
          <div class="signature-input">${datos.firmaVigilante || ''}</div>
        </div>
        <div class="signature-box">
          TIP
          <div class="signature-input">${datos.tip || ''}</div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <div>RECEPTORA PRIVADA DE SERVICIOS DE SEGURIDAD, S.L.U.</div>
        <div>Nº D.G.P. 3.492</div>
      </div>
    </div>
  </body>
  </html>
  `;

  console.log('✅ Contenido HTML del Parte de Alarma generado');
  return html;
}
