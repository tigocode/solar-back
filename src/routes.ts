import { Router } from 'express';
import { CategoryController } from './controllers/CategoryController';
import { ItemController } from './controllers/ItemController';
import { ActivityController } from './controllers/ActivityController';

const router = Router();

// Rotas de Categoria
router.get('/categories', CategoryController.index);
router.post('/categories', CategoryController.create);
router.delete('/categories/:id', CategoryController.delete);
router.put('/categories/:id/rename', CategoryController.rename);

// Rotas de Subcategoria (Modificam a categoria pai)
router.post('/categories/:id/subcategories', CategoryController.addSubcategory);
router.post('/categories/:id/subcategories/remove', CategoryController.removeSubcategory); // Usando POST para delete complexo ou DELETE com body

// --- ROTAS DE ESTOQUE (ITEMS) ---
router.get('/items', ItemController.index);
router.post('/items', ItemController.create);
router.put('/items/:id', ItemController.update);
router.delete('/items/:id', ItemController.delete);

// --- ROTAS DE ATIVIDADES ---
router.get('/activities', ActivityController.index);
router.post('/activities', ActivityController.create);
router.put('/activities/:id', ActivityController.update);
router.patch('/activities/:id/toggle', ActivityController.toggleStatus); // Rota específica para mudar status
router.delete('/activities/:id', ActivityController.delete);

export default router;