import { Request, Response } from 'express';
import { getRepository } from 'fireorm';
import { Item } from '../models/Item';

export const ItemController = {
  
  // Listar todos
  async index(req: Request, res: Response) {
    try {
      const repo = getRepository(Item);
      const items = await repo.find();
      // Garante retorno de array
      const result = Array.isArray(items) ? items : [];
      return res.json(result);
    } catch (error) {
      console.error("Erro ao listar itens:", error);
      return res.status(500).json({ error: 'Erro ao buscar itens' });
    }
  },

  // Criar Item
  async create(req: Request, res: Response) {
    try {
      const { equipamento, modelo, fabricante, qtd, local, caracteristicas } = req.body;

      if (!equipamento || qtd === undefined) {
        return res.status(400).json({ error: 'Equipamento e Quantidade são obrigatórios' });
      }

      const repo = getRepository(Item);
      
      const newItem = new Item();
      newItem.equipamento = equipamento;
      newItem.modelo = modelo || '';
      newItem.fabricante = fabricante || '';
      newItem.qtd = Number(qtd); // Garante que é número
      newItem.local = local || '';
      newItem.caracteristicas = caracteristicas || '';

      const saved = await repo.create(newItem);
      return res.json(saved);
    } catch (error) {
      console.error("Erro ao criar item:", error);
      return res.status(500).json({ error: 'Erro ao criar item' });
    }
  },

  // Atualizar Item
  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const data = req.body;

      const repo = getRepository(Item);
      const item = await repo.findById(id);

      if (!item) return res.status(404).json({ error: 'Item não encontrado' });

      // Atualiza os campos enviados
      if (data.equipamento) item.equipamento = data.equipamento;
      if (data.modelo) item.modelo = data.modelo;
      if (data.fabricante) item.fabricante = data.fabricante;
      if (data.qtd !== undefined) item.qtd = Number(data.qtd);
      if (data.local) item.local = data.local;
      if (data.caracteristicas) item.caracteristicas = data.caracteristicas;

      const updated = await repo.update(item);
      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar item' });
    }
  },

  // Excluir Item
  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const repo = getRepository(Item);
      await repo.delete(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir item' });
    }
  }
};