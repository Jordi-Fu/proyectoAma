"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const documentos_1 = require("../controllers/documentos");
const router = (0, express_1.Router)();
// NUEVAS RUTAS PARA PARTE DE RESPUESTA DE ALARMA
// Generar PDF del Parte de Respuesta de Alarma con datos del formulario (con soporte para imágenes)
router.post('/pdf/parte-alarma', documentos_1.uploadMiddleware, documentos_1.generarPDFParteAlarmaController);
// Generar PDF de ejemplo del Parte de Respuesta de Alarma
router.get('/pdf/parte-alarma/ejemplo', documentos_1.generarPDFParteAlarmaEjemplo);
// RUTAS PARA GESTIÓN DE DOCUMENTOS DEL USUARIO
// Listar documentos del usuario autenticado
router.get('/lista', documentos_1.listarDocumentos);
// Visualizar documento específico
router.get('/visualizar/:nombreArchivo', documentos_1.visualizarDocumento);
// Descargar documento específico
router.get('/descargar/:nombreArchivo', documentos_1.descargarDocumento);
exports.default = router;
