import { Request, Response } from 'express';
import { getRepository } from 'fireorm';
import { Activity } from '../models/Activity';
import { uploadBase64Image } from '../config/cloudinary';

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

// Função auxiliar interna para processar imagens (Sequencial para evitar Timeout)
const processImages = async (fotos: string[]) => {
    const fotoUrls: string[] = [];
    
    if (Array.isArray(fotos) && fotos.length > 0) {
        console.log(`📡 Processando ${fotos.length} imagens...`);
        
        for (const [index, base64] of fotos.entries()) {
            try {
                // Se já for um link (http...), mantém e passa para o próximo
                if (base64.startsWith('http')) {
                    fotoUrls.push(base64);
                    continue;
                }

                // Se for Base64, faz o upload
                console.log(`📤 Subindo imagem ${index + 1}/${fotos.length}...`);
                const url = await uploadBase64Image(base64);
                fotoUrls.push(url);
                
            } catch (err) {
                console.error(`❌ Falha na imagem ${index + 1}, ignorando...`);
            }
        }
        console.log("✅ Imagens processadas!");
    }
    return fotoUrls;
};

export const ActivityController = {
  
  async index(req: Request, res: Response) {
    try {
      const repo = getRepository(Activity);
      const activities = await repo.find();
      // Ordena por data (mais recente primeiro)
      const sorted = activities.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      return res.json(sorted);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar atividades' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { titulo, categoria, subcategoria, data, duracao, descricao, status, fotos } = req.body;

      if (!titulo || !categoria || !data) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
      }

      // Processa as imagens (Sobe para Cloudinary e retorna URLs)
      const fotoUrls = await processImages(fotos);

      const repo = getRepository(Activity);
      
      const newActivity = new Activity();
      newActivity.titulo = titulo;
      newActivity.categoria = categoria;
      newActivity.subcategoria = subcategoria || '';
      newActivity.data = data;
      newActivity.duracao = duracao || '0m';
      newActivity.descricao = descricao || '';
      newActivity.status = status || 'aberta';
      newActivity.createdAt = new Date().toISOString();
      newActivity.fotos = fotoUrls; 

      const saved = await repo.create(newActivity);
      return res.json(saved);

    } catch (error) {
      console.error("Erro ao criar atividade:", error);
      return res.status(500).json({ error: 'Erro ao processar atividade' });
    }
  },

  async update(req: Request, res: Response) {
      try {
        const id = req.params.id as string;
        const { fotos, ...dadosUpdate } = req.body; // Separa as fotos do resto dos dados
        
        const repo = getRepository(Activity);
        const activity = await repo.findById(id);
        
        if (!activity) return res.status(404).json({ error: 'Atividade não encontrada' });
        
        // 1. Protege campos sensíveis que não devem ser alterados manualmente
        delete dadosUpdate.createdAt;
        delete dadosUpdate.duracao;

        // 2. Se houver fotos novas ou removidas, processa novamente
        if (fotos) {
            const novasUrls = await processImages(fotos);
            activity.fotos = novasUrls;
        }

        // 3. Atualiza os outros campos (título, status, descrição...)
        Object.assign(activity, dadosUpdate);

        const updated = await repo.update(activity);
        return res.json(updated);

      } catch (error) { 
        console.error("Erro ao atualizar:", error);
        return res.status(500).json({ error: 'Erro ao atualizar atividade' }); 
      }
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

  // --- ROBÔ DE DURAÇÃO ---
  async updateOpenActivitiesDuration() {
    try {
        // console.log("⏰ Rodando atualização de durações...");
        const repo = getRepository(Activity);
        const activities = await repo.find();
        
        const openActivities = activities.filter(a => a.status === 'aberta' && a.createdAt);

        let count = 0;
        for (const act of openActivities) {
            const newDuration = calculateDuration(act.createdAt);
            
            if (act.duracao !== newDuration) {
                act.duracao = newDuration;
                await repo.update(act);
                count++;
            }
        }
        if(count > 0) console.log(`✅ ${count} atividades atualizadas pelo timer.`);
    } catch (error) {
        console.error("Erro no timer:", error);
    }
  }
};