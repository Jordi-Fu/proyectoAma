// src/server.ts
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { Server as IOServer } from 'socket.io';

import db from '../db/connection';

import routerDocumentos from '../routes/documentos';

class Server {
  private app: Application;
  private port: string;
  private httpServer: http.Server;
  private io: IOServer;

  constructor() {
    this.app  = express();
    this.port = process.env.PORT || '3001';

    // Creamos servidor HTTP y Socket.IO
    this.httpServer = http.createServer(this.app);
    this.io = new IOServer(this.httpServer, {
      cors: { origin: 'http://localhost:4200' }
    });

    this.middlewares();
    this.routes();
    this.dbConnect();
    this.startListening();
  }

  private middlewares() {
    this.app.use(cors({ origin: '*' })); 
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use('/static', express.static(path.join(__dirname, '../img')));    
  }

  private routes() {
    // Disponibilizamos io en req.app
    this.app.use((req, _res, next) => {
      req.app.set('io', this.io);
      next();
    });

    this.app.get('/', (_req: Request, res: Response) => {
      res.json({ msg: 'API Working' });
    });
    this.app.use('/api/documentos', routerDocumentos);

  }

  private async dbConnect() {
    await db.authenticate();
    console.log('📡 Base de datos conectada');
  }


  private startListening() {
    this.httpServer.listen(this.port, () => {
      console.log(`Servidor escuchando en puerto ${this.port}`);
    });
  }
}

export default Server;

