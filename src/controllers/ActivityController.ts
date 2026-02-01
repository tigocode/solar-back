import { Request, Response } from 'express';
import { getRepository } from 'fireorm';
import { Activity } from '../models/Activity';

// Função auxiliar para calcular tempo (Ex: 2h 15m)
const calculateDuration = (startDateIso: string) => {
    const start = new Date(startDateIso).getTime();
    const now = new Date().getTime();
    const diffMs = now - start;

    if (diffMs < 0) return "0m";

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
};

export const ActivityController = {
  
  async index(req: Request, res: Response) {
    try {
      const repo = getRepository(Activity);
      const activities = await repo.find();
      const sorted = activities.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      return res.json(sorted);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar atividades' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { titulo, categoria, subcategoria, data, descricao, status, fotos } = req.body;

      if (!titulo || !categoria || !data) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
      }

      const repo = getRepository(Activity);
      const newActivity = new Activity();
      
      newActivity.titulo = titulo;
      newActivity.categoria = categoria;
      newActivity.subcategoria = subcategoria || '';
      newActivity.data = data;
      newActivity.descricao = descricao || '';
      newActivity.status = status || 'aberta';
      newActivity.fotos = Array.isArray(fotos) ? fotos : [];
      
      // --- LÓGICA DE TEMPO ---
      const now = new Date().toISOString();
      newActivity.createdAt = now; // Salva o momento exato
      newActivity.duracao = "0m";  // Começa zerado

      const saved = await repo.create(newActivity);
      return res.json(saved);
    } catch (error) {
      console.error("Erro ao criar:", error);
      return res.status(500).json({ error: 'Erro ao criar atividade' });
    }
  },

  // ... (Update e Delete e ToggleStatus mantêm iguais) ...
  async update(req: Request, res: Response) {
      try {
        const id = req.params.id as string;
        const data = req.body;
        const repo = getRepository(Activity);
        const activity = await repo.findById(id);
        if (!activity) return res.status(404).json({ error: 'Atividade não encontrada' });
        
        // Remove createdAt/duracao do update manual para não estragar a lógica
        delete data.createdAt;
        delete data.duracao;

        Object.assign(activity, data);
        const updated = await repo.update(activity);
        return res.json(updated);
      } catch (error) { return res.status(500).json({ error: 'Erro ao atualizar' }); }
  },

  async delete(req: Request, res: Response) {
      try {
        const id = req.params.id as string;
        await getRepository(Activity).delete(id);
        return res.status(204).send();
      } catch (e) { return res.status(500).json({error: 'Erro'}); }
  },

  async toggleStatus(req: Request, res: Response) {
     try {
        const id = req.params.id as string;
        const repo = getRepository(Activity);
        const activity = await repo.findById(id);
        if(activity) {
            activity.status = activity.status === 'aberta' ? 'finalizada' : 'aberta';
            await repo.update(activity);
            return res.json(activity);
        }
     } catch (e) { return res.status(500).json({error: 'Erro'}); }
  },

  // --- NOVA FUNÇÃO DO ROBÔ (Chamada pelo Server) ---
  async updateOpenActivitiesDuration() {
    try {
        console.log("⏰ Rodando atualização de durações...");
        const repo = getRepository(Activity);
        const activities = await repo.find();
        
        // Filtra apenas as abertas que possuem createdAt
        const openActivities = activities.filter(a => a.status === 'aberta' && a.createdAt);

        let count = 0;
        for (const act of openActivities) {
            const newDuration = calculateDuration(act.createdAt);
            
            // Só atualiza se mudou
            if (act.duracao !== newDuration) {
                act.duracao = newDuration;
                await repo.update(act);
                count++;
            }
        }
        if(count > 0) console.log(`✅ ${count} atividades tiveram a duração atualizada.`);
    } catch (error) {
        console.error("Erro ao atualizar durações:", error);
    }
  }
};