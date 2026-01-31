import 'reflect-metadata'; // <--- OBRIGATÓRIO NA PRIMEIRA LINHA PARA FIREORM
import express from 'express';
import cors from 'cors';
import './config/firebase'; // Inicializa Firebase/FireORM
import routes from './routes';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Usar Rotas
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`🔥 Servidor Firebase rodando em http://localhost:${PORT}`);
});