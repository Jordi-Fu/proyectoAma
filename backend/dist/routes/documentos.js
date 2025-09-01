"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const documentos_1 = require("../controllers/documentos");
const router = (0, express_1.Router)();
// Generar documento PDF con datos personalizados (incluyendo imágenes) - NUEVA FUNCIONALIDAD PRINCIPAL
router.post('/pdf', documentos_1.uploadMiddleware, documentos_1.generarPDF);
// Generar documento PDF con datos de ejemplo
router.get('/pdf/ejemplo', documentos_1.generarPDFEjemplo);
// Generar documento Word (funcionalidad legacy)
router.post('/word', documentos_1.uploadMiddleware, documentos_1.generarWord);
exports.default = router;
