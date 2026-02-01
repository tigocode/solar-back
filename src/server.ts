import "reflect-metadata";
import express from "express";
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
});
