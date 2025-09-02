import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class AuthController {
  // Login
  public static async login(req: Request, res: Response) {
    try {
      const { nombre, contraseña } = req.body;

      // Validar que se proporcionen los datos requeridos
      if (!nombre || !contraseña) {
        return res.status(400).json({
          message: 'Nombre y contraseña son requeridos'
        });
      }

      // Buscar el usuario por nombre
      const user = await User.findOne({
        where: { nombre }
      });

      if (!user) {
        return res.status(401).json({
          message: 'Credenciales inválidas'
        });
      }

      // Verificar la contraseña
      const isPasswordValid = await user.checkPassword(contraseña);

      if (!isPasswordValid) {
        return res.status(401).json({
          message: 'Credenciales inválidas'
        });
      }

      // Generar JWT token
      const token = jwt.sign(
        { 
          id: user.id,
          nombre: user.nombre,
          ruta: user.ruta,
          apellidos: user.apellidos
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

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

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        message: 'Error interno del servidor'
      });
    }
  }

  // Registrar usuario (opcional)
  public static async register(req: Request, res: Response) {
    try {
      const { nombre, ruta, contraseña, apellidos } = req.body;

      // Validar que se proporcionen todos los datos requeridos
      if (!nombre || !ruta || !contraseña || !apellidos) {
        return res.status(400).json({
          message: 'Todos los campos son requeridos'
        });
      }

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({
        where: { nombre }
      });

      if (existingUser) {
        return res.status(409).json({
          message: 'El usuario ya existe'
        });
      }

      // Crear nuevo usuario
      const newUser = await User.create({
        nombre,
        ruta,
        contraseña,
        apellidos
      });

      // Generar JWT token
      const token = jwt.sign(
        { 
          id: newUser.id,
          nombre: newUser.nombre,
          ruta: newUser.ruta,
          apellidos: newUser.apellidos
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

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

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        message: 'Error interno del servidor'
      });
    }
  }

  // Verificar token
  public static async verifyToken(req: Request, res: Response) {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          message: 'Token no proporcionado'
        });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Buscar el usuario para asegurarse de que aún existe
      const user = await User.findByPk(decoded.id);

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

    } catch (error) {
      console.error('Error verificando token:', error);
      res.status(401).json({
        message: 'Token inválido'
      });
    }
  }
}
