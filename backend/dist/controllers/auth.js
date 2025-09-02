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
exports.AuthController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
class AuthController {
    // Login
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, contraseña } = req.body;
                // Validar que se proporcionen los datos requeridos
                if (!nombre || !contraseña) {
                    return res.status(400).json({
                        message: 'Nombre y contraseña son requeridos'
                    });
                }
                // Buscar el usuario por nombre
                const user = yield user_1.default.findOne({
                    where: { nombre }
                });
                if (!user) {
                    return res.status(401).json({
                        message: 'Credenciales inválidas'
                    });
                }
                // Verificar la contraseña
                const isPasswordValid = yield user.checkPassword(contraseña);
                if (!isPasswordValid) {
                    return res.status(401).json({
                        message: 'Credenciales inválidas'
                    });
                }
                // Generar JWT token
                const token = jsonwebtoken_1.default.sign({
                    id: user.id,
                    nombre: user.nombre,
                    ruta: user.ruta,
                    apellidos: user.apellidos
                }, JWT_SECRET, { expiresIn: '24h' });
                // Respuesta exitosa (sin incluir la contraseña)
                res.status(200).json({
                    message: 'Login exitoso',
                    token,
                    user: {
                        id: user.id,
                        nombre: user.nombre,
                        ruta: user.ruta,
                        apellidos: user.apellidos
                    }
                });
            }
            catch (error) {
                console.error('Error en login:', error);
                res.status(500).json({
                    message: 'Error interno del servidor'
                });
            }
        });
    }
    // Registrar usuario (opcional)
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, ruta, contraseña, apellidos } = req.body;
                // Validar que se proporcionen todos los datos requeridos
                if (!nombre || !ruta || !contraseña || !apellidos) {
                    return res.status(400).json({
                        message: 'Todos los campos son requeridos'
                    });
                }
                // Verificar si el usuario ya existe
                const existingUser = yield user_1.default.findOne({
                    where: { nombre }
                });
                if (existingUser) {
                    return res.status(409).json({
                        message: 'El usuario ya existe'
                    });
                }
                // Crear nuevo usuario
                const newUser = yield user_1.default.create({
                    nombre,
                    ruta,
                    contraseña,
                    apellidos
                });
                // Generar JWT token
                const token = jsonwebtoken_1.default.sign({
                    id: newUser.id,
                    nombre: newUser.nombre,
                    ruta: newUser.ruta,
                    apellidos: newUser.apellidos
                }, JWT_SECRET, { expiresIn: '24h' });
                // Respuesta exitosa (sin incluir la contraseña)
                res.status(201).json({
                    message: 'Usuario registrado exitosamente',
                    token,
                    user: {
                        id: newUser.id,
                        nombre: newUser.nombre,
                        ruta: newUser.ruta,
                        apellidos: newUser.apellidos
                    }
                });
            }
            catch (error) {
                console.error('Error en registro:', error);
                res.status(500).json({
                    message: 'Error interno del servidor'
                });
            }
        });
    }
    // Verificar token
    static verifyToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
                if (!token) {
                    return res.status(401).json({
                        message: 'Token no proporcionado'
                    });
                }
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                // Buscar el usuario para asegurarse de que aún existe
                const user = yield user_1.default.findByPk(decoded.id);
                if (!user) {
                    return res.status(401).json({
                        message: 'Usuario no encontrado'
                    });
                }
                res.status(200).json({
                    message: 'Token válido',
                    user: {
                        id: user.id,
                        nombre: user.nombre,
                        ruta: user.ruta,
                        apellidos: user.apellidos
                    }
                });
            }
            catch (error) {
                console.error('Error verificando token:', error);
                res.status(401).json({
                    message: 'Token inválido'
                });
            }
        });
    }
}
exports.AuthController = AuthController;
