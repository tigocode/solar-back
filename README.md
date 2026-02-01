# SOLAR BACK-END

## 🔧 Visão geral
Projeto back-end em **TypeScript** usando **Express**, **Firebase Admin** e **FireORM**. Fornece uma API REST para gerenciar **categorias**, **itens** e **atividades** (com suporte a fotos em base64 e cálculo automático de durações para atividades abertas).

---

## ✅ Principais funcionalidades
- CRUD completo para **categories**, **items** e **activities**
- Persistência em **Cloud Firestore** via **FireORM**
- Agendador que atualiza automaticamente a **duração** de atividades **abertas** a cada 15 minutos
- Upload de fotos em `base64` (aceito via JSON; limite de request body configurado)
- Tipos e validações simples no backend; lógica para evitar duplicatas em subcategorias

---

## 🔌 Dependências principais
- `express`
- `firebase-admin`
- `fireorm`
- `reflect-metadata`
- `body-parser` (limite de 50MB configurado)
- `cors`

> Veja `package.json` para a lista completa de dependências e versões.

---

## 📁 Estrutura importante
- `src/server.ts` — inicializa o servidor, middlewares (CORS, body-parser) e o agendador de durações
- `src/routes.ts` — define as rotas da API (prefixo `/api`)
- `src/config/firebase.ts` — inicializa `firebase-admin` e `fireorm` (usa `src/serviceAccountKey.json` por padrão)
- `src/controllers` — lógica para `Activity`, `Category` e `Item`
- `src/models` — entidades FireORM: `Activity`, `Category`, `Item`

---

## 🚩 Observações técnicas importantes
- Porta padrão: **3001** (configurada diretamente em `src/server.ts`).
- Ao iniciar, o servidor chama **imediatamente** `ActivityController.updateOpenActivitiesDuration()` e depois roda essa função a cada **15 minutos** para manter o campo `duracao` atualizado.
- `Activity` possui campos especiais:
  - `createdAt` (ISO string) — inserido na criação e usado para calcular `duracao`;
  - `duracao` (string formatada, ex: `2h 15m`) — atualizada automaticamente pelo agendador.
- `body-parser` foi configurado para aceitar payloads grandes: `limit: "50mb"` (útil para fotos em base64).
- `tsconfig.json` já habilita `experimentalDecorators` e `emitDecoratorMetadata`, necessários para FireORM.

---

## 🔁 Rotas (resumo)
Todas as rotas estão prefixadas com `/api`.

| Recurso | Método | Endpoint | Descrição |
|---|---:|---|---|
| Categories | GET | `/api/categories` | Lista todas as categorias |
| Categories | POST | `/api/categories` | Cria uma categoria (`{ nome }`) |
| Categories | DELETE | `/api/categories/:id` | Remove uma categoria |
| Categories | PUT | `/api/categories/:id/rename` | Renomeia categoria (`{ nome }`) |
| Categories | POST | `/api/categories/:id/subcategories` | Adiciona subcategoria (`{ nomeSub }`) |
| Categories | POST | `/api/categories/:id/subcategories/remove` | Remove subcategoria (`{ nomeSub }`) |
| Items | GET | `/api/items` | Lista todos os itens |
| Items | POST | `/api/items` | Cria item (`{ equipamento, qtd, ... }`) |
| Items | PUT | `/api/items/:id` | Atualiza item |
| Items | DELETE | `/api/items/:id` | Remove item |
| Activities | GET | `/api/activities` | Lista atividades (ordenadas por `data` desc) |
| Activities | POST | `/api/activities` | Cria atividade (`{ titulo, categoria, data, ... }`) |
| Activities | PUT | `/api/activities/:id` | Atualiza atividade (não é possível alterar `createdAt`/`duracao` manualmente) |
| Activities | PATCH | `/api/activities/:id/toggle` | Alterna status entre `aberta` / `finalizada` |
| Activities | DELETE | `/api/activities/:id` | Exclui atividade |

---

## 🔧 Exemplos rápidos (curl)
- Criar categoria:

```bash
curl -s -X POST http://localhost:3001/api/categories \
  -H "Content-Type: application/json" \
  -d '{"nome": "Manutenção"}'
```

- Criar atividade (com fotos em base64 — `fotos` é array de strings):

```bash
curl -s -X POST http://localhost:3001/api/activities \
  -H "Content-Type: application/json" \
  -d '{
    "titulo":"Checagem painel",
    "categoria":"Manutenção",
    "data":"2026-02-01",
    "descricao":"Inspeção mensal",
    "fotos":["data:image/jpeg;base64,/9j/4AAQSkZJR..."],
    "status":"aberta"
  }'
```

- Alternar status de atividade:

```bash
curl -s -X PATCH http://localhost:3001/api/activities/<ID>/toggle
```

---

## ⚙️ Scripts úteis
- `npm run dev` — executa `nodemon src/server.ts` (modo dev com reload)
- `npm run build` — compila TypeScript para `dist/` (`tsc`)
- `npm run start` — executa `node dist/server.js`

---

## 🔒 Segurança e boas práticas
- **Não** versionar `src/serviceAccountKey.json`. Use variáveis de ambiente ou segredos do CI/CD.
- Se quiser armazenar muitas imagens, prefira usar um serviço de arquivos (ex: Cloud Storage) em vez de enviar grandes payloads em base64 para o Firestore.
- Considerar adicionar autenticação (JWT / Firebase Auth) e validações mais sólidas nas rotas.

> Dica: é recomendável extrair a porta e outras configurações sensíveis para variáveis de ambiente (ex: `PORT`, `FIREBASE_CONFIG`) para maior flexibilidade em produção.

---

## ✅ Próximos passos sugeridos
- Adicionar testes unitários e de integração
- Externalizar configurações sensíveis (usar `dotenv` / variáveis de ambiente)
- Implementar upload direto para Cloud Storage para reduzir payloads
- Adicionar autenticação/autorizações nas rotas

---

Se quiser, eu adapto o `README` para incluir exemplos `curl` para todas as rotas, um guia de deploy (Heroku/GCP/AWS) ou um `Makefile`/`Dockerfile` para facilitar o deploy. 🚀
