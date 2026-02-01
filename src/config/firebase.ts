import * as admin from 'firebase-admin';
import * as fireorm from 'fireorm';
import dotenv from 'dotenv';

dotenv.config();

// Se estiver rodando local e existir o arquivo, usa ele.
// Se estiver em produção (Render), usa a variável de ambiente.
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Produção: Lê da variável de texto e converte para JSON
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Local: Lê do arquivo
  try {
    serviceAccount = require('../serviceAccountKey.json');
  } catch (e) {
    console.error("Erro: serviceAccountKey.json não encontrado e variável FIREBASE_SERVICE_ACCOUNT não definida.");
  }
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const firestore = admin.firestore();

// Correção para o FireORM funcionar em prod
fireorm.initialize(firestore);

console.log("🔥 Firebase conectado!");

export { admin, firestore };