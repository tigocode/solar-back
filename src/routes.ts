import { Router } from 'express';
// Remova o import do multer
import { CategoryController } from './controllers/CategoryController';
import { ItemController } from './controllers/ItemController';
import { ActivityController } from './controllers/ActivityController';

const router = Router();

// --- ROTAS (SEM MULTER) ---

// Categorias
router.get('/categories', CategoryController.index);
router.post('/categories', CategoryController.create);
router.delete('/categories/:id', CategoryController.delete);
router.put('/categories/:id/rename', CategoryController.rename);
router.post('/categories/:id/subcategories', CategoryController.addSubcategory);
router.post('/categories/:id/subcategories/remove', CategoryController.removeSubcategory);

// Itens
router.get('/items', ItemController.index);
router.post('/items', ItemController.create);
router.put('/items/:id', ItemController.update);
router.delete('/items/:id', ItemController.delete);

// Atividades
router.get('/activities', ActivityController.index);
// ROTA LIMPA (Voltou a ser JSON padrão)
router.post('/activities', ActivityController.create); 
router.put('/activities/:id', ActivityController.update);
router.patch('/activities/:id/toggle', ActivityController.toggleStatus);
router.delete('/activities/:id', ActivityController.delete);

export default router;