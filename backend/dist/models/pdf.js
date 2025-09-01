"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generarPDF = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
/**
 * Función para generar PDF con datos e imágenes
 */
const generarPDF = (datos, imagenes) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('=== INICIO DE GENERACIÓN PDF ===');
        console.log('Procesando PDF con datos:', datos);
        console.log('Procesando con', (imagenes === null || imagenes === void 0 ? void 0 : imagenes.length) || 0, 'imágenes');
        // Agregar fecha actual si no se proporciona
        if (!datos.fecha) {
            datos.fecha = new Date().toLocaleDateString('es-ES');
        }
        // Generar HTML para el PDF
        const htmlContent = generarHTMLContenido(datos, imagenes);
        // Lanzar Puppeteer para generar PDF
        const browser = yield puppeteer_1.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = yield browser.newPage();
        // Configurar el contenido HTML
        yield page.setContent(htmlContent, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });
        // Generar el PDF
        const pdfBuffer = yield page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            }
        });
        yield browser.close();
        console.log('✅ PDF generado exitosamente, tamaño:', pdfBuffer.length, 'bytes');
        console.log('=== GENERACIÓN PDF COMPLETADA ===');
        return Buffer.from(pdfBuffer);
    }
    catch (error) {
        console.error('Error al generar PDF:', error);
        throw new Error(`Error al generar el PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
});
exports.generarPDF = generarPDF;
/**
 * Generar contenido HTML para el PDF
 */
function generarHTMLContenido(datos, imagenes) {
    console.log('🔄 Generando contenido HTML...');
    // Convertir imágenes a base64 si existen
    const imagenesBase64 = (imagenes === null || imagenes === void 0 ? void 0 : imagenes.map(imagen => {
        const base64 = imagen.buffer.toString('base64');
        return {
            data: `data:${imagen.mimetype};base64,${base64}`,
            name: imagen.originalname || 'Imagen'
        };
    })) || [];
    const html = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documento Personalizado</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Arial', sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #fff;
      }
      
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      
      .header {
        text-align: center;
        margin-bottom: 40px;
        border-bottom: 3px solid #667eea;
        padding-bottom: 20px;
      }
      
      .header h1 {
        color: #667eea;
        font-size: 2.5em;
        font-weight: bold;
        margin-bottom: 10px;
      }
      
      .header p {
        color: #666;
        font-size: 1.1em;
      }
      
      .info-section {
        margin-bottom: 40px;
      }
      
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
      }
      
      .info-item {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid #667eea;
      }
      
      .info-item strong {
        color: #667eea;
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
      }
      
      .info-item span {
        color: #333;
        font-size: 1.05em;
      }
      
      .full-width {
        grid-column: 1 / -1;
      }
      
      .images-section {
        margin-top: 40px;
        page-break-inside: avoid;
      }
      
      .images-title {
        color: #667eea;
        font-size: 1.5em;
        font-weight: bold;
        margin-bottom: 20px;
        text-align: center;
        border-bottom: 2px solid #667eea;
        padding-bottom: 10px;
      }
      
      .image-container {
        margin-bottom: 30px;
        text-align: center;
        page-break-inside: avoid;
      }
      
      .image-container img {
        max-width: 100%;
        max-height: 400px;
        width: auto;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        margin-bottom: 10px;
      }
      
      .image-caption {
        font-style: italic;
        color: #666;
        font-size: 0.9em;
      }
      
      .footer {
        margin-top: 50px;
        text-align: center;
        padding-top: 20px;
        border-top: 2px solid #eee;
        color: #666;
        font-size: 0.9em;
      }
      
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .container { margin: 0; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1>Documento Personalizado</h1>
        <p>Información detallada del usuario</p>
      </div>
      
      <!-- Information Section -->
      <div class="info-section">
        <div class="info-grid">
          ${datos.nombre ? `
            <div class="info-item">
              <strong>Nombre:</strong>
              <span>${datos.nombre}</span>
            </div>
          ` : ''}
          
          ${datos.apellidos ? `
            <div class="info-item">
              <strong>Apellidos:</strong>
              <span>${datos.apellidos}</span>
            </div>
          ` : ''}
          
          ${datos.email ? `
            <div class="info-item">
              <strong>Email:</strong>
              <span>${datos.email}</span>
            </div>
          ` : ''}
          
          ${datos.telefono ? `
            <div class="info-item">
              <strong>Teléfono:</strong>
              <span>${datos.telefono}</span>
            </div>
          ` : ''}
          
          ${datos.empresa ? `
            <div class="info-item">
              <strong>Empresa:</strong>
              <span>${datos.empresa}</span>
            </div>
          ` : ''}
          
          ${datos.cargo ? `
            <div class="info-item">
              <strong>Cargo:</strong>
              <span>${datos.cargo}</span>
            </div>
          ` : ''}
          
          ${datos.direccion ? `
            <div class="info-item full-width">
              <strong>Dirección:</strong>
              <span>${datos.direccion}</span>
            </div>
          ` : ''}
          
          <div class="info-item">
            <strong>Fecha de generación:</strong>
            <span>${datos.fecha}</span>
          </div>
        </div>
      </div>
      
      <!-- Images Section -->
      ${imagenesBase64.length > 0 ? `
        <div class="images-section">
          <h2 class="images-title">Imágenes Adjuntas</h2>
          ${imagenesBase64.map((imagen, index) => `
            <div class="image-container">
              <img src="${imagen.data}" alt="${imagen.name}" />
              <div class="image-caption">${imagen.name}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <!-- Footer -->
      <div class="footer">
        <p>Documento generado automáticamente - ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}</p>
      </div>
    </div>
  </body>
  </html>
  `;
    console.log('✅ Contenido HTML generado');
    return html;
}
