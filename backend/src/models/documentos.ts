import sequelize from '../db/connection';
import { QueryTypes } from 'sequelize';
import * as fs from 'fs';
import * as path from 'path';
import { createReport } from 'docx-templates';
import puppeteer from 'puppeteer';
import AdmZip = require('adm-zip');
import { crearPlantillaBasica } from '../utils/crearPlantilla';

// Interfaz para los datos que se van a rellenar en la plantilla
export interface DatosPlantilla {
  nombre?: string;
  apellidos?: string;
  edad?: number;
  email?: string;
  telefono?: string;
  direccion?: string;
  fecha?: string;
  empresa?: string;
  cargo?: string;
  salario?: number;
}

// Función para generar documento Word desde plantilla
export const getPDF = async (datos: DatosPlantilla, imagenes?: Express.Multer.File[]): Promise<Buffer> => {
  try {
    console.log('=== INICIO DEL PROCESAMIENTO ===');
    console.log('Procesando plantilla con datos:', datos);
    console.log('Procesando con', imagenes?.length || 0, 'imágenes');
    
    // Ruta de la plantilla Word
    const rutaPlantilla = path.join(__dirname, '../assets/Documentos/plantilla1.docx');
    console.log('Ruta de la plantilla:', rutaPlantilla);
    
    // Verificar que la plantilla existe
    if (!fs.existsSync(rutaPlantilla)) {
      console.log('⚠️ La plantilla no existe, creando una básica...');
      crearPlantillaBasica(rutaPlantilla);
    }
    
    console.log('✅ Plantilla encontrada exitosamente');
    
    // Leer el archivo Word como ZIP
    const zip = new AdmZip(rutaPlantilla);
    console.log('✅ Archivo Word leído como ZIP');
    
    // Obtener el contenido del documento
    let documentContent = zip.readAsText('word/document.xml');
    console.log('✅ Contenido XML del documento extraído');
    
    // Asegurar que los namespaces necesarios estén presentes
    if (imagenes && imagenes.length > 0) {
      documentContent = asegurarNamespaces(documentContent);
    }
    
    // Realizar reemplazos directos en el XML
    console.log('🔄 Reemplazando campos en el XML...');
    
    // Agregar fecha actual si no se proporciona
    if (!datos.fecha) {
      datos.fecha = new Date().toLocaleDateString('es-ES');
    }
    
    Object.entries(datos).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        const regex = new RegExp(`{${key}}`, 'g');
        const valorString = String(value);
        const matches = documentContent.match(regex);
        
        if (matches) {
          console.log(`✅ Reemplazando {${key}} con "${valorString}" (${matches.length} ocurrencias)`);
          documentContent = documentContent.replace(regex, valorString);
        } else {
          console.log(`⚠️ No se encontró {${key}} para reemplazar`);
        }
      }
    });
    
    // Procesar imágenes si existen
    if (imagenes && imagenes.length > 0) {
      console.log('🖼️ Procesando imágenes...');
      documentContent = await agregarImagenesAlDocumento(documentContent, imagenes, zip);
    }
    
    // Actualizar el contenido en el ZIP
    zip.updateFile('word/document.xml', Buffer.from(documentContent, 'utf8'));
    console.log('✅ Contenido XML actualizado en el ZIP');
    
    // Generar el nuevo documento Word
    const documentoFinal = zip.toBuffer();
    console.log('✅ Documento Word final generado, tamaño:', documentoFinal.length, 'bytes');
    
    console.log('=== PROCESAMIENTO COMPLETADO EXITOSAMENTE ===');
    return documentoFinal;
    
  } catch (error) {
    console.error('Error al procesar la plantilla:', error);
    throw new Error(`Error al generar el documento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

/**
 * Función para agregar imágenes al documento Word
 */
async function agregarImagenesAlDocumento(
  documentContent: string, 
  imagenes: Express.Multer.File[], 
  zip: AdmZip
): Promise<string> {
  
  console.log('📸 Agregando', imagenes.length, 'imágenes al documento...');
  
  // Generar IDs únicos para las imágenes
  const imagenesInfo = imagenes.map((imagen, index) => ({
    id: `img${Date.now()}${index}`,
    filename: `image${index + 1}.${imagen.mimetype.split('/')[1]}`,
    buffer: imagen.buffer,
    mimetype: imagen.mimetype,
    originalName: imagen.originalname,
    relationshipId: '' // Se asignará más adelante
  }));
  
  // Agregar imágenes al ZIP en la carpeta word/media/
  imagenesInfo.forEach((info) => {
    zip.addFile(`word/media/${info.filename}`, info.buffer);
    console.log(`✅ Imagen agregada al ZIP: word/media/${info.filename} (${info.buffer.length} bytes)`);
  });
  
  // Actualizar [Content_Types].xml para incluir las imágenes
  let contentTypes = zip.readAsText('[Content_Types].xml');
  
  imagenesInfo.forEach((info) => {
    const extension = info.mimetype.split('/')[1];
    const mimeType = info.mimetype;
    
    // Verificar si la extensión ya está registrada
    if (!contentTypes.includes(`Extension="${extension}"`)) {
      // Buscar el último </Default> y agregar después
      const lastDefaultIndex = contentTypes.lastIndexOf('</Default>');
      if (lastDefaultIndex !== -1) {
        const insertPoint = lastDefaultIndex + '</Default>'.length;
        const newDefault = `\n  <Default Extension="${extension}" ContentType="${mimeType}"/>`;
        contentTypes = contentTypes.substring(0, insertPoint) + newDefault + contentTypes.substring(insertPoint);
        console.log(`✅ Tipo de contenido agregado: ${extension} -> ${mimeType}`);
      }
    }
    
    // También agregar una entrada Override específica para cada imagen
    const overridePath = `/word/media/${info.filename}`;
    if (!contentTypes.includes(`PartName="${overridePath}"`)) {
      const overrideSection = contentTypes.indexOf('</Types>');
      if (overrideSection !== -1) {
        const newOverride = `  <Override PartName="${overridePath}" ContentType="${mimeType}"/>\n`;
        contentTypes = contentTypes.substring(0, overrideSection) + newOverride + contentTypes.substring(overrideSection);
        console.log(`✅ Override agregado para: ${overridePath}`);
      }
    }
  });
  
  zip.updateFile('[Content_Types].xml', Buffer.from(contentTypes, 'utf8'));
  
  // Actualizar word/_rels/document.xml.rels para las relaciones de imágenes
  let relsContent = zip.readAsText('word/_rels/document.xml.rels');
  
  // Encontrar el próximo ID disponible analizando las relaciones existentes
  const existingIds = relsContent.match(/Id="rId(\d+)"/g) || [];
  let maxId = 0;
  existingIds.forEach(match => {
    const id = parseInt(match.match(/\d+/)?.[0] || '0');
    if (id > maxId) maxId = id;
  });
  
  let relationshipId = maxId + 1; // Empezar desde el siguiente ID disponible
  
  imagenesInfo.forEach((info) => {
    const newRel = `<Relationship Id="rId${relationshipId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${info.filename}"/>`;
    const closeTag = '</Relationships>';
    relsContent = relsContent.replace(closeTag, '  ' + newRel + '\n' + closeTag);
    info.relationshipId = `rId${relationshipId}`;
    console.log(`✅ Relación creada: ${info.relationshipId} -> ${info.filename}`);
    relationshipId++;
  });
  
  zip.updateFile('word/_rels/document.xml.rels', Buffer.from(relsContent, 'utf8'));
  
  // Agregar las imágenes al final del documento
  let imagenesXML = '';
  imagenesInfo.forEach((info, index) => {
    const imageId = relationshipId + index + 100; // ID único para cada imagen
    
    // Crear XML para la imagen con estructura más simple y válida
    const imageXML = `
    <w:p>
      <w:pPr>
        <w:spacing w:after="240"/>
      </w:pPr>
      <w:r>
        <w:drawing>
          <wp:inline distT="0" distB="0" distL="0" distR="0">
            <wp:extent cx="4572000" cy="3048000"/>
            <wp:effectExtent l="0" t="0" r="0" b="0"/>
            <wp:docPr id="${imageId}" name="Imagen ${index + 1}"/>
            <wp:cNvGraphicFramePr>
              <a:graphicFrameLocks noChangeAspect="1"/>
            </wp:cNvGraphicFramePr>
            <a:graphic>
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic>
                  <pic:nvPicPr>
                    <pic:cNvPr id="${imageId}" name="Imagen ${index + 1}"/>
                    <pic:cNvPicPr/>
                  </pic:nvPicPr>
                  <pic:blipFill>
                    <a:blip r:embed="${info.relationshipId}">
                      <a:extLst>
                        <a:ext uri="{28A0092B-C50C-407E-A947-70E740481C1C}">
                          <a14:useLocalDpi val="0"/>
                        </a:ext>
                      </a:extLst>
                    </a:blip>
                    <a:stretch>
                      <a:fillRect/>
                    </a:stretch>
                  </pic:blipFill>
                  <pic:spPr>
                    <a:xfrm>
                      <a:off x="0" y="0"/>
                      <a:ext cx="4572000" cy="3048000"/>
                    </a:xfrm>
                    <a:prstGeom prst="rect">
                      <a:avLst/>
                    </a:prstGeom>
                  </pic:spPr>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      </w:r>
    </w:p>`;
    
    imagenesXML += imageXML;
  });
  
  // Insertar las imágenes antes del cierre del body del documento
  const bodyCloseTag = '</w:body>';
  if (documentContent.includes(bodyCloseTag)) {
    documentContent = documentContent.replace(bodyCloseTag, imagenesXML + '\n' + bodyCloseTag);
    console.log('✅ Imágenes insertadas en el documento');
  } else {
    console.log('⚠️ No se pudo encontrar el cierre del body, agregando al final');
    documentContent += imagenesXML;
  }
  
  return documentContent;
}

/**
 * Asegurar que el documento tenga todos los namespaces necesarios
 */
function asegurarNamespaces(documentContent: string): string {
  console.log('🔧 Verificando y agregando namespaces necesarios...');
  
  // Namespaces requeridos para imágenes
  const namespacesRequeridos = [
    'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"',
    'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"',
    'xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"',
    'xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main"'
  ];
  
  // Buscar el tag raíz del documento
  const documentTagRegex = /<w:document[^>]*>/;
  const match = documentContent.match(documentTagRegex);
  
  if (match) {
    let documentTag = match[0];
    let needsUpdate = false;
    
    // Verificar y agregar namespaces faltantes
    namespacesRequeridos.forEach(namespace => {
      const nsName = namespace.split('=')[0].replace('xmlns:', '');
      if (!documentTag.includes(`xmlns:${nsName}=`)) {
        console.log(`✅ Agregando namespace: ${namespace}`);
        documentTag = documentTag.replace('>', ` ${namespace}>`);
        needsUpdate = true;
      }
    });
    
    if (needsUpdate) {
      documentContent = documentContent.replace(documentTagRegex, documentTag);
      console.log('✅ Namespaces actualizados correctamente');
    } else {
      console.log('✅ Todos los namespaces ya están presentes');
    }
  }
  
  return documentContent;
}