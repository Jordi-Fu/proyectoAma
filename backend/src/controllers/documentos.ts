import { Request, Response } from 'express';
import { getPDF, DatosPlantilla } from '../models/documentos';
import { generarPDF as generarPDFNuevo, DatosPDF } from '../models/pdf';
import multer from 'multer';

// Configurar multer para manejar archivos en memoria
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB por archivo
    },
    fileFilter: (req, file, cb) => {
        // Solo permitir imágenes
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

// Middleware para manejar múltiples imágenes
export const uploadMiddleware = upload.array('imagenes', 10); // Máximo 10 imágenes

// Función para generar PDF (nueva funcionalidad principal)
export const generarPDF = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Iniciando generación de documento PDF...');
        
        // Obtener datos del body (ahora puede venir como string en FormData)
        let datos: DatosPDF = {};
        
        if (req.body?.datos) {
            if (typeof req.body.datos === 'string') {
                datos = JSON.parse(req.body.datos);
            } else {
                datos = req.body.datos;
            }
        }
        
        // Obtener archivos de imágenes
        const imagenes = req.files as Express.Multer.File[];
        
        console.log('Datos recibidos:', datos);
        console.log('Imágenes recibidas:', imagenes?.length || 0);

        // Validar que se recibieron algunos datos o imágenes
        if ((!datos || Object.keys(datos).length === 0) && (!imagenes || imagenes.length === 0)) {
            res.status(400).json({ 
                error: 'No se proporcionaron datos ni imágenes',
                message: 'Debe enviar al menos un campo de texto o una imagen'
            });
            return;
        }

        // Generar el documento PDF
        const pdfBuffer = await generarPDFNuevo(datos, imagenes);

        // Configurar headers para descargar el documento PDF
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="documento_personalizado.pdf"',
            'Content-Length': pdfBuffer.length.toString()
        });

        console.log('Enviando documento PDF generado...');
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('Error en generarPDF:', error);
        res.status(500).json({ 
            error: 'Error al generar el documento PDF',
            message: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Función para generar PDF de ejemplo
export const generarPDFEjemplo = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Generando documento PDF de ejemplo...');
        
        // Datos de ejemplo
        const datosEjemplo = {
            nombre: 'Juan Carlos',
            apellidos: 'García Martínez', 
            email: 'juan.garcia@email.com',
            telefono: '+34 123 456 789',
            direccion: 'Calle Principal 123, Madrid, España',
            empresa: 'TechSolutions S.A.',
            cargo: 'Desarrollador Full Stack'
        };

        // Generar el documento PDF
        const pdfBuffer = await generarPDFNuevo(datosEjemplo);

        // Configurar headers para descargar el documento PDF
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="documento_ejemplo.pdf"',
            'Content-Length': pdfBuffer.length.toString()
        });

        console.log('Enviando documento PDF de ejemplo...');
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('Error en generarPDFEjemplo:', error);
        res.status(500).json({ 
            error: 'Error al generar el documento PDF de ejemplo',
            message: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Función para generar Word (funcionalidad legacy mantenida)
export const generarWord = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Iniciando generación de documento Word...');
        
        // Obtener datos del body (ahora puede venir como string en FormData)
        let datos: DatosPlantilla = {};
        
        if (req.body?.datos) {
            if (typeof req.body.datos === 'string') {
                datos = JSON.parse(req.body.datos);
            } else {
                datos = req.body.datos;
            }
        }
        
        // Obtener archivos de imágenes
        const imagenes = req.files as Express.Multer.File[];
        
        console.log('Datos recibidos:', datos);
        console.log('Imágenes recibidas:', imagenes?.length || 0);

        // Validar que se recibieron algunos datos o imágenes
        if ((!datos || Object.keys(datos).length === 0) && (!imagenes || imagenes.length === 0)) {
            res.status(400).json({ 
                error: 'No se proporcionaron datos ni imágenes',
                message: 'Debe enviar al menos un campo de texto o una imagen'
            });
            return;
        }

        // Generar el documento Word
        const documentoBuffer = await getPDF(datos, imagenes);

        // Configurar headers para descargar el documento Word
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': 'attachment; filename="documento_personalizado.docx"',
            'Content-Length': documentoBuffer.length.toString()
        });

        console.log('Enviando documento Word generado...');
        res.send(documentoBuffer);
        
    } catch (error) {
        console.error('Error en generarWord:', error);
        res.status(500).json({ 
            error: 'Error al generar el documento Word',
            message: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};