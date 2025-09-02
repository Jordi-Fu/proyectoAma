import { Router } from 'express';
import { AuthController } from '../controllers/auth';

const router = Router();

// Ruta para login
router.post('/login', AuthController.login);

// Ruta para registro (opcional)
router.post('/register', AuthController.register);

// Ruta para verificar token
router.get('/verify', AuthController.verifyToken);

export default router;
