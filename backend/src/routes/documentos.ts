import {Router} from 'express';
import { generarPDFParteAlarmaController, generarPDFParteAlarmaEjemplo, uploadMiddleware} from '../controllers/documentos';

const router = Router();

// NUEVAS RUTAS PARA PARTE DE RESPUESTA DE ALARMA
// Generar PDF del Parte de Respuesta de Alarma con datos del formulario (con soporte para imágenes)
router.post('/pdf/parte-alarma', uploadMiddleware, generarPDFParteAlarmaController);

// Generar PDF de ejemplo del Parte de Respuesta de Alarma
router.get('/pdf/parte-alarma/ejemplo', generarPDFParteAlarmaEjemplo);


export default router;