// backend/src/config/firebase.ts
import * as admin from 'firebase-admin';
import * as fireorm from 'fireorm';

// Importa o JSON que você baixou (o TypeScript pode reclamar, mas funciona se habilitar resolveJsonModule, 
// ou podemos fazer o require direto como abaixo para simplificar)
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com` // URL padrão
});

const firestore = admin.firestore();
fireorm.initialize(firestore);

console.log("🔥 Firebase & FireORM Inicializados!");

export { admin, firestore };