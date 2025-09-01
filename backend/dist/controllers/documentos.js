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
exports.generarWord = exports.generarPDFEjemplo = exports.generarPDF = exports.uploadMiddleware = void 0;
const documentos_1 = require("../models/documentos");
const pdf_1 = require("../models/pdf");
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
// Función para generar PDF (nueva funcionalidad principal)
const generarPDF = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('Iniciando generación de documento PDF...');
        // Obtener datos del body (ahora puede venir como string en FormData)
        let datos = {};
        if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.datos) {
            if (typeof req.body.datos === 'string') {
                datos = JSON.parse(req.body.datos);
            }
            else {
                datos = req.body.datos;
            }
        }
        // Obtener archivos de imágenes
        const imagenes = req.files;
        console.log('Datos recibidos:', datos);
        console.log('Imágenes recibidas:', (imagenes === null || imagenes === void 0 ? void 0 : imagenes.length) || 0);
        // Validar que se recibieron algunos datos o imágenes
        if ((!datos || Object.keys(datos).length === 0) && (!imagenes || imagenes.length === 0)) {
            res.status(400).json({
                error: 'No se proporcionaron datos ni imágenes',
                message: 'Debe enviar al menos un campo de texto o una imagen'
            });
            return;
        }
        // Generar el documento PDF
        const pdfBuffer = yield (0, pdf_1.generarPDF)(datos, imagenes);
        // Configurar headers para descargar el documento PDF
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="documento_personalizado.pdf"',
            'Content-Length': pdfBuffer.length.toString()
        });
        console.log('Enviando documento PDF generado...');
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error('Error en generarPDF:', error);
        res.status(500).json({
            error: 'Error al generar el documento PDF',
            message: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.generarPDF = generarPDF;
// Función para generar PDF de ejemplo
const generarPDFEjemplo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const pdfBuffer = yield (0, pdf_1.generarPDF)(datosEjemplo);
        // Configurar headers para descargar el documento PDF
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="documento_ejemplo.pdf"',
            'Content-Length': pdfBuffer.length.toString()
        });
        console.log('Enviando documento PDF de ejemplo...');
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error('Error en generarPDFEjemplo:', error);
        res.status(500).json({
            error: 'Error al generar el documento PDF de ejemplo',
            message: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.generarPDFEjemplo = generarPDFEjemplo;
// Función para generar Word (funcionalidad legacy mantenida)
const generarWord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('Iniciando generación de documento Word...');
        // Obtener datos del body (ahora puede venir como string en FormData)
        let datos = {};
        if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.datos) {
            if (typeof req.body.datos === 'string') {
                datos = JSON.parse(req.body.datos);
            }
            else {
                datos = req.body.datos;
            }
        }
        // Obtener archivos de imágenes
        const imagenes = req.files;
        console.log('Datos recibidos:', datos);
        console.log('Imágenes recibidas:', (imagenes === null || imagenes === void 0 ? void 0 : imagenes.length) || 0);
        // Validar que se recibieron algunos datos o imágenes
        if ((!datos || Object.keys(datos).length === 0) && (!imagenes || imagenes.length === 0)) {
            res.status(400).json({
                error: 'No se proporcionaron datos ni imágenes',
                message: 'Debe enviar al menos un campo de texto o una imagen'
            });
            return;
        }
        // Generar el documento Word
        const documentoBuffer = yield (0, documentos_1.getPDF)(datos, imagenes);
        // Configurar headers para descargar el documento Word
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': 'attachment; filename="documento_personalizado.docx"',
            'Content-Length': documentoBuffer.length.toString()
        });
        console.log('Enviando documento Word generado...');
        res.send(documentoBuffer);
    }
    catch (error) {
        console.error('Error en generarWord:', error);
        res.status(500).json({
            error: 'Error al generar el documento Word',
            message: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.generarWord = generarWord;
