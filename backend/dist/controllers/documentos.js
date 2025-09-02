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
exports.generarPDFParteAlarmaEjemplo = exports.generarPDFParteAlarmaController = exports.uploadMiddleware = void 0;
const parteAlarma_1 = require("../models/parteAlarma");
const multer_1 = __importDefault(require("multer"));
// Configurar multer para manejar archivos en memoria
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB por archivo
    },
    fileFilter: (req, file, cb) => {
        // Solo permitir imágenes
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    }
});
// Middleware para manejar múltiples imágenes
exports.uploadMiddleware = upload.array('imagenes', 10); // Máximo 10 imágenes
// Función para generar PDF del Parte de Respuesta de Alarma
const generarPDFParteAlarmaController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Iniciando generación de PDF Parte de Alarma...');
        // Obtener datos del body o FormData
        let datos;
        let imagenes = [];
        // Verificar si es FormData (con imágenes) o JSON simple
        if (req.is('multipart/form-data')) {
            // Si es FormData, los datos están en req.body.datos como string JSON
            datos = req.body.datos ? JSON.parse(req.body.datos) : req.body;
            imagenes = req.files || [];
            console.log('Datos recibidos como FormData');
            console.log('Número de imágenes recibidas:', imagenes.length);
        }
        else {
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
        const pdfBuffer = yield (0, parteAlarma_1.generarPDFParteAlarma)(datos);
        // Configurar headers para descargar el documento PDF
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="parte_respuesta_alarma.pdf"',
            'Content-Length': pdfBuffer.length.toString()
        });
        console.log('Enviando PDF Parte de Alarma generado...');
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error('Error en generarPDFParteAlarmaController:', error);
        res.status(500).json({
            error: 'Error al generar el PDF del Parte de Alarma',
            message: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.generarPDFParteAlarmaController = generarPDFParteAlarmaController;
// Función para generar PDF de ejemplo del Parte de Alarma
const generarPDFParteAlarmaEjemplo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Generando PDF de ejemplo del Parte de Alarma...');
        // Datos de ejemplo
        const datosEjemplo = {
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
        const pdfBuffer = yield (0, parteAlarma_1.generarPDFParteAlarma)(datosEjemplo);
        // Configurar headers para descargar el documento PDF
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="parte_alarma_ejemplo.pdf"',
            'Content-Length': pdfBuffer.length.toString()
        });
        console.log('Enviando PDF de ejemplo del Parte de Alarma...');
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error('Error en generarPDFParteAlarmaEjemplo:', error);
        res.status(500).json({
            error: 'Error al generar el PDF de ejemplo del Parte de Alarma',
            message: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.generarPDFParteAlarmaEjemplo = generarPDFParteAlarmaEjemplo;
