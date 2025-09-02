import { Request, Response } from 'express';
import { generarPDFParteAlarma, DatosParteAlarma } from '../models/parteAlarma';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

// Configurar multer para manejar archivos en memoria
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 * 1024 // 10GB por archivo
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

// Función para generar PDF del Parte de Respuesta de Alarma
export const generarPDFParteAlarmaController = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Iniciando generación de PDF Parte de Alarma...');
        
        // Obtener información del usuario autenticado
        const user = getUserFromToken(req);
        if (!user) {
            res.status(401).json({ error: 'Token inválido' });
            return;
        }

        // Obtener datos del body o FormData
        let datos: DatosParteAlarma;
        let imagenes: Express.Multer.File[] = [];

        // Verificar si es FormData (con imágenes) o JSON simple
        if (req.is('multipart/form-data')) {
            // Si es FormData, los datos están en req.body.datos como string JSON
            datos = req.body.datos ? JSON.parse(req.body.datos) : req.body;
            imagenes = req.files as Express.Multer.File[] || [];
            console.log('Datos recibidos como FormData');
            console.log('Número de imágenes recibidas:', imagenes.length);
        } else {
            // Si es JSON simple
            datos = req.body;
            console.log('Datos recibidos como JSON');
        }
        
        console.log('Datos recibidos para Parte de Alarma:', datos);

        // Validar que se recibieron algunos datos
        if (!datos || Object.keys(datos).length === 0) {
            res.status(400).json({ 
                error: 'No se proporcionaron datos',
                message: 'Debe enviar al menos un campo del formulario'
            });
            return;
        }

        // Convertir imágenes a base64 si existen
        if (imagenes.length > 0) {
            datos.imagenes = imagenes.map(imagen => {
                const base64 = imagen.buffer.toString('base64');
                return `data:${imagen.mimetype};base64,${base64}`;
            });
            console.log('Imágenes convertidas a base64:', datos.imagenes.length);
        }

        // Generar el documento PDF
        const pdfBuffer = await generarPDFParteAlarma(datos);

        // Crear la carpeta del usuario si no existe
        const rutaUsuario = path.join(__dirname, '../..', user.ruta);
        if (!fs.existsSync(rutaUsuario)) {
            fs.mkdirSync(rutaUsuario, { recursive: true });
            console.log('Carpeta del usuario creada:', rutaUsuario);
        }

        // Generar nombre de archivo único
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const nombreArchivo = `parte_respuesta_alarma_${timestamp}.pdf`;
        const rutaArchivo = path.join(rutaUsuario, nombreArchivo);

        // Guardar el archivo en la carpeta del usuario
        fs.writeFileSync(rutaArchivo, pdfBuffer);
        console.log('Archivo guardado en:', rutaArchivo);

        // Configurar headers para descargar el documento PDF
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
            'Content-Length': pdfBuffer.length.toString()
        });

        console.log('Enviando PDF Parte de Alarma generado...');
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('Error en generarPDFParteAlarmaController:', error);
        res.status(500).json({ 
            error: 'Error al generar el PDF del Parte de Alarma',
            message: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Función para generar PDF de ejemplo del Parte de Alarma
export const generarPDFParteAlarmaEjemplo = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Generando PDF de ejemplo del Parte de Alarma...');
        
        // Datos de ejemplo
        const datosEjemplo: DatosParteAlarma = {
            zonas: 'A1, A2, B3',
            fecha: new Date().toLocaleDateString('es-ES'),
            cliente: 'EMPRESA EJEMPLO S.L.',
            abonado: '123456',
            direccion: 'Calle Principal 123',
            poblacion: 'Madrid',
            intrusion: true,
            horaAviso: '14:30',
            horaLlegadaInstalacion: '14:45',
            sirena: true,
            personalFfcc: false,
            zona: true,
            puertasAbiertas: true,
            verificacionPerimetral: true,
            seResetea: true,
            alarmaConfirmada: 'no',
            horaFin: '15:15',
            observaciones: 'Falsa alarma causada por fuerte viento que activó sensor de vibración en puerta principal. No se detectaron signos de intrusión.',
            firmaVigilante: 'Juan Pérez',
            tip: '001'
        };

        // Generar el documento PDF
        const pdfBuffer = await generarPDFParteAlarma(datosEjemplo);

        // Configurar headers para descargar el documento PDF
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="parte_alarma_ejemplo.pdf"',
            'Content-Length': pdfBuffer.length.toString()
        });

        console.log('Enviando PDF de ejemplo del Parte de Alarma...');
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('Error en generarPDFParteAlarmaEjemplo:', error);
        res.status(500).json({ 
            error: 'Error al generar el PDF de ejemplo del Parte de Alarma',
            message: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Interface para el usuario en el JWT
interface JWTUser {
    id: number;
    nombre: string;
    ruta: string;
    apellidos: string;
}

// Función para obtener la información del usuario desde el JWT
const getUserFromToken = (req: Request): JWTUser | null => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ No se encontró header de autorización válido');
            return null;
        }

        const token = authHeader.substring(7);
        console.log('🔑 Token recibido:', token);
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        console.log('📦 Token decodificado:', decoded);
        console.log('👤 Usuario desde token:', {
            id: decoded.id,
            nombre: decoded.nombre,
            ruta: decoded.ruta,
            apellidos: decoded.apellidos
        });
        
        return decoded;
    } catch (error) {
        console.error('Error decodificando token:', error);
        return null;
    }
};

// Función para listar documentos del usuario
export const listarDocumentos = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = getUserFromToken(req);
        if (!user) {
            res.status(401).json({ error: 'Token inválido' });
            return;
        }

        console.log('🔍 Listando documentos para usuario:', user.nombre, 'con ruta:', user.ruta);

        const { pagina = '1', limite = '10', busqueda = '' } = req.query;
        const paginaNum = parseInt(pagina as string) || 1;
        const limiteNum = parseInt(limite as string) || 10;
        const busquedaStr = busqueda as string;

        // Construir la ruta de la carpeta del usuario
        const rutaUsuario = path.join(__dirname, '../..', user.ruta);
        console.log('📁 Ruta de archivos del usuario:', rutaUsuario);
        console.log('📂 Ruta absoluta calculada:', path.resolve(rutaUsuario));

        // Verificar si la carpeta existe
        if (!fs.existsSync(rutaUsuario)) {
            console.log('⚠️ La carpeta del usuario no existe:', rutaUsuario);
            // Crear la carpeta si no existe
            fs.mkdirSync(rutaUsuario, { recursive: true });
            console.log('✅ Carpeta creada:', rutaUsuario);
            
            res.json({
                documentos: [],
                total: 0,
                pagina: paginaNum,
                totalPaginas: 0
            });
            return;
        }

        console.log('✅ La carpeta existe, leyendo archivos...');

        // Leer archivos de la carpeta
        const archivos = fs.readdirSync(rutaUsuario);
        console.log('📄 Archivos encontrados:', archivos);
        
        // Filtrar solo archivos (no directorios) y aplicar búsqueda
        let documentos = archivos
            .filter(archivo => {
                const rutaCompleta = path.join(rutaUsuario, archivo);
                const esArchivo = fs.statSync(rutaCompleta).isFile();
                const coincideBusqueda = busquedaStr === '' || 
                    archivo.toLowerCase().includes(busquedaStr.toLowerCase());
                return esArchivo && coincideBusqueda;
            })
            .map(archivo => {
                const rutaCompleta = path.join(rutaUsuario, archivo);
                const stats = fs.statSync(rutaCompleta);
                return {
                    nombre: archivo,
                    ruta: rutaCompleta,
                    fechaCreacion: stats.birthtime,
                    tamano: stats.size
                };
            });

        console.log('📋 Documentos procesados:', documentos.length);

        // Ordenar por fecha de creación (más reciente primero)
        documentos.sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime());

        // Aplicar paginación
        const total = documentos.length;
        const inicio = (paginaNum - 1) * limiteNum;
        const documentosPaginados = documentos.slice(inicio, inicio + limiteNum);

        const totalPaginas = Math.ceil(total / limiteNum);

        console.log('📤 Enviando respuesta:', {
            total: total,
            pagina: paginaNum,
            totalPaginas: totalPaginas,
            documentosEnPagina: documentosPaginados.length
        });

        res.json({
            documentos: documentosPaginados,
            total,
            pagina: paginaNum,
            totalPaginas
        });

    } catch (error) {
        console.error('Error listando documentos:', error);
        res.status(500).json({ 
            error: 'Error al listar documentos',
            message: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Función para visualizar un documento
export const visualizarDocumento = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = getUserFromToken(req);
        if (!user) {
            res.status(401).json({ error: 'Token inválido' });
            return;
        }

        const { nombreArchivo } = req.params;
        
        // Construir la ruta del archivo
        const rutaArchivo = path.join(__dirname, '../..', user.ruta, nombreArchivo);

        // Verificar que el archivo existe y está dentro de la carpeta del usuario
        if (!fs.existsSync(rutaArchivo)) {
            res.status(404).json({ error: 'Archivo no encontrado' });
            return;
        }

        // Verificar que el archivo está dentro de la carpeta del usuario (seguridad)
        const rutaUsuario = path.join(__dirname, '../..', user.ruta);
        const rutaRelativa = path.relative(rutaUsuario, rutaArchivo);
        if (rutaRelativa.startsWith('..') || path.isAbsolute(rutaRelativa)) {
            res.status(403).json({ error: 'Acceso denegado al archivo' });
            return;
        }

        // Obtener el tipo MIME del archivo
        const extension = path.extname(nombreArchivo).toLowerCase();
        let contentType = 'application/octet-stream';
        
        switch (extension) {
            case '.pdf':
                contentType = 'application/pdf';
                break;
            case '.doc':
            case '.docx':
                contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                break;
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.txt':
                contentType = 'text/plain';
                break;
        }

        // Configurar headers para visualización
        res.set({
            'Content-Type': contentType,
            'Content-Disposition': 'inline',
            'Cache-Control': 'no-cache'
        });

        // Enviar el archivo
        const fileStream = fs.createReadStream(rutaArchivo);
        fileStream.pipe(res);

    } catch (error) {
        console.error('Error visualizando documento:', error);
        res.status(500).json({ 
            error: 'Error al visualizar documento',
            message: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Función para descargar un documento
export const descargarDocumento = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = getUserFromToken(req);
        if (!user) {
            res.status(401).json({ error: 'Token inválido' });
            return;
        }

        const { nombreArchivo } = req.params;
        
        // Construir la ruta del archivo
        const rutaArchivo = path.join(__dirname, '../..', user.ruta, nombreArchivo);

        // Verificar que el archivo existe y está dentro de la carpeta del usuario
        if (!fs.existsSync(rutaArchivo)) {
            res.status(404).json({ error: 'Archivo no encontrado' });
            return;
        }

        // Verificar que el archivo está dentro de la carpeta del usuario (seguridad)
        const rutaUsuario = path.join(__dirname, '../..', user.ruta);
        const rutaRelativa = path.relative(rutaUsuario, rutaArchivo);
        if (rutaRelativa.startsWith('..') || path.isAbsolute(rutaRelativa)) {
            res.status(403).json({ error: 'Acceso denegado al archivo' });
            return;
        }

        // Configurar headers para descarga
        res.set({
            'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
            'Cache-Control': 'no-cache'
        });

        // Enviar el archivo
        const fileStream = fs.createReadStream(rutaArchivo);
        fileStream.pipe(res);

    } catch (error) {
        console.error('Error descargando documento:', error);
        res.status(500).json({ 
            error: 'Error al descargar documento',
            message: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};


