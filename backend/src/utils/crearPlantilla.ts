import * as fs from 'fs';
import * as path from 'path';
import AdmZip = require('adm-zip');

/**
 * Crear una plantilla Word básica si no existe
 */
export const crearPlantillaBasica = (rutaPlantilla: string): void => {
  if (fs.existsSync(rutaPlantilla)) {
    console.log('✅ La plantilla ya existe');
    return;
  }

  console.log('🔧 Creando plantilla básica...');

  // Crear un documento Word básico
  const zip = new AdmZip();

  // Content Types
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
</Types>`;

  // Main relationships
  const mainRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

  // Document relationships
  const documentRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  // Main document content
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
           xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
           xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
           xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"
           xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main"
           xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Title"/>
      </w:pPr>
      <w:r>
        <w:t>Documento Personalizado</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:r>
        <w:t>Nombre: {nombre}</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:r>
        <w:t>Apellidos: {apellidos}</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:r>
        <w:t>Email: {email}</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:r>
        <w:t>Teléfono: {telefono}</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:r>
        <w:t>Dirección: {direccion}</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:r>
        <w:t>Empresa: {empresa}</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:r>
        <w:t>Cargo: {cargo}</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:r>
        <w:t>Fecha: {fecha}</w:t>
      </w:r>
    </w:p>
    
  </w:body>
</w:document>`;

  // Styles
  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Calibri"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
  
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:spacing w:after="300"/>
      <w:jc w:val="center"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="32"/>
      <w:szCs w:val="32"/>
    </w:rPr>
  </w:style>
  
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:pPr>
      <w:spacing w:after="200"/>
    </w:pPr>
  </w:style>
</w:styles>`;

  // App properties
  const appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>Generated Document</Application>
  <Company>ProyectoAma</Company>
</Properties>`;

  // Core properties
  const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:creator>ProyectoAma</dc:creator>
  <cp:lastModifiedBy>ProyectoAma</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
</cp:coreProperties>`;

  // Agregar archivos al ZIP
  zip.addFile('[Content_Types].xml', Buffer.from(contentTypes, 'utf8'));
  zip.addFile('_rels/.rels', Buffer.from(mainRels, 'utf8'));
  zip.addFile('word/document.xml', Buffer.from(documentXml, 'utf8'));
  zip.addFile('word/_rels/document.xml.rels', Buffer.from(documentRels, 'utf8'));
  zip.addFile('word/styles.xml', Buffer.from(stylesXml, 'utf8'));
  zip.addFile('docProps/app.xml', Buffer.from(appXml, 'utf8'));
  zip.addFile('docProps/core.xml', Buffer.from(coreXml, 'utf8'));

  // Asegurar que el directorio existe
  const directorioPlantilla = path.dirname(rutaPlantilla);
  if (!fs.existsSync(directorioPlantilla)) {
    fs.mkdirSync(directorioPlantilla, { recursive: true });
  }

  // Escribir el archivo
  zip.writeZip(rutaPlantilla);
  console.log('✅ Plantilla básica creada exitosamente en:', rutaPlantilla);
};
