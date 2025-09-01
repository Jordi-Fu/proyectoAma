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
// src/server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const connection_1 = __importDefault(require("../db/connection"));
const documentos_1 = __importDefault(require("../routes/documentos"));
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || '3001';
        // Creamos servidor HTTP y Socket.IO
        this.httpServer = http_1.default.createServer(this.app);
        this.io = new socket_io_1.Server(this.httpServer, {
            cors: { origin: 'http://localhost:4200' }
        });
        this.middlewares();
        this.routes();
        this.dbConnect();
        this.startListening();
    }
    middlewares() {
        this.app.use((0, cors_1.default)({ origin: '*' }));
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use('/static', express_1.default.static(path_1.default.join(__dirname, '../img')));
    }
    routes() {
        // Disponibilizamos io en req.app
        this.app.use((req, _res, next) => {
            req.app.set('io', this.io);
            next();
        });
        this.app.get('/', (_req, res) => {
            res.json({ msg: 'API Working' });
        });
        this.app.use('/api/documentos', documentos_1.default);
    }
    dbConnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield connection_1.default.authenticate();
            console.log('📡 Base de datos conectada');
        });
    }
    startListening() {
        this.httpServer.listen(this.port, () => {
            console.log(`Servidor escuchando en puerto ${this.port}`);
        });
    }
}
exports.default = Server;
