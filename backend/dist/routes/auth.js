"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const router = (0, express_1.Router)();
// Ruta para login
router.post('/login', auth_1.AuthController.login);
// Ruta para registro (opcional)
router.post('/register', auth_1.AuthController.register);
// Ruta para verificar token
router.get('/verify', auth_1.AuthController.verifyToken);
exports.default = router;
