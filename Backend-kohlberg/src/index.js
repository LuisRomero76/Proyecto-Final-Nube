import express from 'express';
import { PORT } from "./config.js";
import usuariosRoutes from './routers/routes.js';
import adminRouters from './routers/admin.routes.js';
import dotenv from "dotenv";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

app.use('/assets/vinos', express.static(path.join(__dirname, '../public/assets/vinos')));

app.use(cors(
    {
        origin: 'https://com610-g11-frontend.rootcode.com.bo',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(usuariosRoutes);
app.use(adminRouters);

app.listen(PORT);
console.log(`El servidor esta corriendo en el puerto: ${PORT}`);
