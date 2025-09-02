import {Router} from 'express';
import { generarPDFParteAlarmaController, generarPDFParteAlarmaEjemplo, uploadMiddleware, listarDocumentos, visualizarDocumento, descargarDocumento} from '../controllers/documentos';

const router = Router();

// NUEVAS RUTAS PARA PARTE DE RESPUESTA DE ALARMA
// Generar PDF del Parte de Respuesta de Alarma con datos del formulario (con soporte para imágenes)
router.post('/pdf/parte-alarma', uploadMiddleware, generarPDFParteAlarmaController);

// Generar PDF de ejemplo del Parte de Respuesta de Alarma
router.get('/pdf/parte-alarma/ejemplo', generarPDFParteAlarmaEjemplo);

// RUTAS PARA GESTIÓN DE DOCUMENTOS DEL USUARIO
// Listar documentos del usuario autenticado
router.get('/lista', listarDocumentos);

// Visualizar documento específico
router.get('/visualizar/:nombreArchivo', visualizarDocumento);

// Descargar documento específico
router.get('/descargar/:nombreArchivo', descargarDocumento);

export default router;