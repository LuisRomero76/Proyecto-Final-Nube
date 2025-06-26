import mysql from 'mysql';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de la conexión a la base de datos usando variables de entorno
export const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

