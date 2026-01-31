import { Request, Response } from 'express';
import { getRepository } from 'fireorm';
import { Activity } from '../models/Activity';

export const ActivityController = {
  
  // Listar todas
  async index(req: Request, res: Response) {
    try {
      const repo = getRepository(Activity);
      
      // Busca todas
      const activities = await repo.find();
      
      // O FireORM básico não tem "orderBy" complexo na query direta de array,
      // então ordenamos via Javascript (Data mais recente primeiro)
      const sorted = activities.sort((a, b) => {
        return new Date(b.data).getTime() - new Date(a.data).getTime();
      });

      return res.json(sorted);
    } catch (error) {
      console.error("Erro ao listar atividades:", error);
      return res.status(500).json({ error: 'Erro ao buscar atividades' });
    }
  },

  // Criar
  async create(req: Request, res: Response) {
    try {
      const { titulo, categoria, subcategoria, data, duracao, descricao, status, fotos } = req.body;

      if (!titulo || !categoria || !data) {
        return res.status(400).json({ error: 'Título, Categoria e Data são obrigatórios' });
      }

      const repo = getRepository(Activity);
      
      const newActivity = new Activity();
      newActivity.titulo = titulo;
      newActivity.categoria = categoria;
      newActivity.subcategoria = subcategoria || '';
      newActivity.data = data;
      newActivity.duracao = duracao || '';
      newActivity.descricao = descricao || '';
      newActivity.status = status || 'aberta';
      newActivity.fotos = Array.isArray(fotos) ? fotos : [];

      const saved = await repo.create(newActivity);
      return res.json(saved);
    } catch (error) {
      console.error("Erro ao criar atividade:", error);
      return res.status(500).json({ error: 'Erro ao criar atividade' });
    }
  },

  // Atualizar
  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const data = req.body;

      const repo = getRepository(Activity);
      const activity = await repo.findById(id);

      if (!activity) return res.status(404).json({ error: 'Atividade não encontrada' });

      // Atualiza campos
      if (data.titulo) activity.titulo = data.titulo;
      if (data.categoria) activity.categoria = data.categoria;
      if (data.subcategoria !== undefined) activity.subcategoria = data.subcategoria;
      if (data.data) activity.data = data.data;
      if (data.duracao !== undefined) activity.duracao = data.duracao;
      if (data.descricao !== undefined) activity.descricao = data.descricao;
      if (data.status) activity.status = data.status;
      if (data.fotos) activity.fotos = data.fotos;

      const updated = await repo.update(activity);
      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar atividade' });
    }
  },

  // Alternar Status (Atalho útil)
  async toggleStatus(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const repo = getRepository(Activity);
        const activity = await repo.findById(id);
  
        if (!activity) return res.status(404).json({ error: 'Atividade não encontrada' });
  
        activity.status = activity.status === 'aberta' ? 'finalizada' : 'aberta';
        
        const updated = await repo.update(activity);
        return res.json(updated);
      } catch (error) {
        return res.status(500).json({ error: 'Erro ao alterar status' });
      }
  },

  // Excluir
  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const repo = getRepository(Activity);
      await repo.delete(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir atividade' });
    }
  }
};