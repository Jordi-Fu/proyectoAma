"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize(process.env.DB_NAME || 'test', process.env.DB_USER || 'postgres', process.env.DB_PASSWORD || 'Df8002025', {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: "postgres",
    logging: false,
});
exports.default = sequelize;
