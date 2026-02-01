import "reflect-metadata";
import express from "express";
import { startKeepAlive } from './services/keepAlive';
import cors from "cors";
import bodyParser from "body-parser"; // <--- Importe isso
import "./config/firebase";
import routes from "./routes";
import { ActivityController } from "./controllers/ActivityController";

const app = express();
const PORT = 3001;

app.use(cors());

// --- AUMENTANDO O LIMITE COM BODY-PARSER ---
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use("/api", routes);
app.get('/status', (req, res) => {
  res.status(200).json({ message: 'Sistema Solar-Back Online' });
});
console.log("Cloudinary Config Check:", process.env.CLOUDINARY_CLOUD_NAME ? "OK (Carregado)" : "FALHOU (Undefined)");

app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando em http://localhost:${PORT}`);
  // --- AGENDADOR (CRON SIMPLIFICADO) ---
  // Roda a cada 15 minutos (15 * 60 * 1000 milissegundos)
  const INTERVALO_15_MIN = 15 * 60 * 1000;

  // Roda imediatamente ao iniciar para atualizar o que estava pendente
  ActivityController.updateOpenActivitiesDuration();

  setInterval(() => {
    ActivityController.updateOpenActivitiesDuration();
  }, INTERVALO_15_MIN);

  // Verifica se está em produção e se a URL foi definida
  if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
    startKeepAlive(process.env.RENDER_EXTERNAL_URL);
  }
});
