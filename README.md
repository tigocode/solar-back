# SOLAR BACK-END

## 🔧 Visão geral
Projeto back-end em **TypeScript** usando **Express**, **Firebase Admin** e **FireORM**. Serve como API para gerenciar **categorias**, **itens** e **atividades** (com fotos e durações calculadas automaticamente).

## ✅ Principais funcionalidades
- Endpoints REST para **categories**, **items** e **activities**
- Persistência em **Firestore** via **FireORM**
- Agendador que atualiza a **duração** de atividades abertas a cada 15 minutos
- Suporte a uploads de fotos como base64 (payload maior tratado com body-parser, limite 50MB)

## 🔌 Dependências principais
- express
- firebase-admin
- fireorm
- reflect-metadata
- body-parser
- cors

## 📁 Estrutura relevante
- `src/server.ts` — inicializa o servidor, middlewares e agendador
- `src/routes.ts` — rotas principais:
  - GET /api/categories
  - POST /api/categories
  - DELETE /api/categories/:id
  - PUT /api/categories/:id/rename
  - POST /api/categories/:id/subcategories
  - POST /api/categories/:id/subcategories/remove
  - GET /api/items
  - POST /api/items
  - PUT /api/items/:id
  - DELETE /api/items/:id
  - GET /api/activities
  - POST /api/activities
  - PUT /api/activities/:id
  - PATCH /api/activities/:id/toggle
  - DELETE /api/activities/:id
- `src/controllers` — lógica de negócio para cada recurso
- `src/models` — entidades FireORM: `Activity`, `Category`, `Item`
- `src/config/firebase.ts` — inicializa **firebase-admin** e **fireorm** (usa `serviceAccountKey.json`)

## ⚙️ Setup (rápido)
1. Instale dependências: `npm install`
2. Coloque seu arquivo de credenciais do Firebase em `src/serviceAccountKey.json` (não comite este arquivo)
3. Rodar em modo desenvolvimento: `npm run dev`
4. Build: `npm run build` → Start: `npm run start`

> Observação: O `tsconfig.json` já ativa `experimentalDecorators` e `emitDecoratorMetadata`, exigidos pelo FireORM.

## 🔒 Segurança e boas práticas
- Não versionar `serviceAccountKey.json`. Use segredos do CI/CD ou variáveis de ambiente sempre que possível.
- Considere limitar o tamanho de uploads ou usar armazenamento especializado (Cloud Storage) para fotos muito grandes.

## ℹ️ Observações operacionais
- O servidor escuta na porta `3001` por padrão.
- Ao iniciar, o servidor executa imediatamente `ActivityController.updateOpenActivitiesDuration()` e repete a cada 15 minutos para manter durações atualizadas.

---
Se quiser, posso adicionar exemplos de requisições `curl` para cada rota ou um arquivo `README` mais detalhado com instruções de deploy 🚀