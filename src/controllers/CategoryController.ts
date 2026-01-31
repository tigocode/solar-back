import { Request, Response } from 'express';
import { getRepository } from 'fireorm';
import { Category } from '../models/Category';

export const CategoryController = {
  
// Listar todas
  async index(req: Request, res: Response) {
    try {
      const repo = getRepository(Category);
      const categories = await repo.find();

      console.log("Dados do Firestore:", categories); // <--- LOG PARA DEBUG

      // CORREÇÃO: Se categories não for array (ex: undefined ou {}), devolve []
      const result = Array.isArray(categories) ? categories : [];
      
      return res.json(result);
    } catch (error) {
      console.error("Erro no Index:", error); // <--- LOG DE ERRO
      return res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
  },

  // Criar Categoria
  async create(req: Request, res: Response) {
    try {
      const { nome } = req.body;
      if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });

      const repo = getRepository(Category);
      
      // Cria o objeto
      const newCategory = new Category();
      newCategory.nome = nome;
      newCategory.subcategorias = []; 

      const saved = await repo.create(newCategory);
      return res.json(saved);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar categoria' });
    }
  },

  // Adicionar Subcategoria
  async addSubcategory(req: Request, res: Response) {
    try {
      // CORREÇÃO AQUI: Forçamos o tipo "as string"
      const id = req.params.id as string; 
      const { nomeSub } = req.body;

      const repo = getRepository(Category);
      const category = await repo.findById(id);

      if (!category) return res.status(404).json({ error: 'Categoria não encontrada' });

      // Validação: Evitar duplicatas
      if (category.subcategorias.includes(nomeSub)) {
        return res.status(400).json({ error: 'Subcategoria já existe' });
      }

      category.subcategorias.push(nomeSub);
      
      const updated = await repo.update(category);
      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao adicionar subcategoria' });
    }
  },

  // Remover Subcategoria
  async removeSubcategory(req: Request, res: Response) {
    try {
      // CORREÇÃO AQUI: Forçamos o tipo "as string"
      const id = req.params.id as string;
      const { nomeSub } = req.body; 

      const repo = getRepository(Category);
      const category = await repo.findById(id);

      if (!category) return res.status(404).json({ error: 'Categoria não encontrada' });

      category.subcategorias = category.subcategorias.filter(sub => sub !== nomeSub);
      
      const updated = await repo.update(category);
      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao remover subcategoria' });
    }
  },

  // Excluir Categoria Inteira
  async delete(req: Request, res: Response) {
    try {
      // CORREÇÃO AQUI: Forçamos o tipo "as string"
      const id = req.params.id as string;
      
      const repo = getRepository(Category);
      await repo.delete(id);
      return res.status(204).send(); // No content
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir categoria' });
    }
  },

  // Renomear Categoria
  async rename(req: Request, res: Response) {
      try {
          // CORREÇÃO AQUI: Forçamos o tipo "as string"
          const id = req.params.id as string;
          const { nome } = req.body;
          
          const repo = getRepository(Category);
          const category = await repo.findById(id);
          
          if(!category) return res.status(404).json({error: "Categoria não encontrada"});

          category.nome = nome;
          const updated = await repo.update(category);
          return res.json(updated);
      } catch (error) {
          return res.status(500).json({ error: 'Erro ao renomear' });
      }
  }
};