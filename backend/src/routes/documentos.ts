import {Router} from 'express';
import {generarPDF, generarPDFEjemplo, generarWord, uploadMiddleware} from '../controllers/documentos';

const router = Router();

// Generar documento PDF con datos personalizados (incluyendo imágenes) - NUEVA FUNCIONALIDAD PRINCIPAL
router.post('/pdf', uploadMiddleware, generarPDF);

// Generar documento PDF con datos de ejemplo
router.get('/pdf/ejemplo', generarPDFEjemplo);

// Generar documento Word (funcionalidad legacy)
router.post('/word', uploadMiddleware, generarWord);

export default router;