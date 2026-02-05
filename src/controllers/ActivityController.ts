import { Request, Response } from 'express';
import { getRepository } from 'fireorm';
import { Activity } from '../models/Activity';
import { uploadBase64Image } from '../config/cloudinary';

// Função auxiliar para calcular tempo (Ex: 2h 15m)
const calculateDuration = (startDateIso: string) => {
    if (!startDateIso) return "0m";

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
      // Recebemos userId, userName e setor do Front
      const { titulo, categoria, subcategoria, setor, data, duracao, descricao, status, fotos, userId, userName } = req.body;

      if (!categoria || !data) { 
         return res.status(400).json({ error: 'Campos obrigatórios faltando' });
      }

      // Processa as imagens
      const fotoUrls = await processImages(fotos);

      const repo = getRepository(Activity);
      const newActivity = new Activity();

      // REGRA 6: Se for Roçada, o título é gerado automaticamente
      if (categoria === 'Roçada') {
         newActivity.titulo = `Roçada - ${subcategoria || 'Geral'} - ${setor || 'N/A'}`;
      } else {
         newActivity.titulo = titulo || 'Sem Título';
      }

      newActivity.categoria = categoria;
      newActivity.subcategoria = subcategoria || '';
      newActivity.setor = setor || ''; // Salva o setor
      newActivity.data = data;
      newActivity.descricao = descricao || '';
      
      // Data de criação real
      newActivity.createdAt = new Date().toISOString();

      // REGRA 7: Se tem fotos, já nasce finalizada
      if (fotoUrls.length > 0) {
        newActivity.status = 'finalizada';
        newActivity.duracao = '0m'; // Se já nasceu com foto, execução foi imediata/prévia
      } else {
        newActivity.status = status || 'aberta';
        newActivity.duracao = duracao || '0m';
      }
      
      newActivity.fotos = fotoUrls; 
      
      // REGRA 4: Vincula ao usuário
      newActivity.userId = userId;
      newActivity.userName = userName;

      const saved = await repo.create(newActivity);
      return res.json(saved);

    } catch (error) {
      console.error("Erro ao criar:", error);
      return res.status(500).json({ error: 'Erro ao processar atividade' });
    }
  },

  async update(req: Request, res: Response) {
      try {
        const id = req.params.id as string;
        const { fotos, ...dadosUpdate } = req.body; 
        
        const repo = getRepository(Activity);
        const activity = await repo.findById(id);
        
        if (!activity) return res.status(404).json({ error: 'Atividade não encontrada' });
        
        // Protege campos sensíveis
        delete dadosUpdate.createdAt;
        delete dadosUpdate.duracao; // Importante: não aceita duração vinda do front no update simples

        // Processa fotos novas
        if (fotos) {
            const novasUrls = await processImages(fotos);
            activity.fotos = novasUrls;
            
            // REGRA 7 (No Update): Se adicionou fotos e estava aberta, finaliza E CALCULA O TEMPO
            if (novasUrls.length > 0 && activity.status === 'aberta') {
                activity.status = 'finalizada';
                
                // --- MELHORIA APLICADA AQUI ---
                // Calcula a duração final baseada no tempo decorrido desde a criação
                activity.duracao = calculateDuration(activity.createdAt);
                console.log(`🏁 Atividade finalizada automaticamente via upload. Duração final: ${activity.duracao}`);
            }
        }

        Object.assign(activity, dadosUpdate);

        // REGRA 6 (No Update): Recalcula título se mudou dados de Roçada
        if (activity.categoria === 'Roçada') {
             activity.titulo = `Roçada - ${activity.subcategoria} - ${activity.setor}`;
        }

        const updated = await repo.update(activity);
        return res.json(updated);

      } catch (error) { 
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
            const novoStatus = activity.status === 'aberta' ? 'finalizada' : 'aberta';
            activity.status = novoStatus;

            // --- MELHORIA APLICADA AQUI ---
            // Se o admin finalizou manualmente, também calculamos o tempo final
            if (novoStatus === 'finalizada') {
                activity.duracao = calculateDuration(activity.createdAt);
            }

            await repo.update(activity);
            return res.json(activity);
        }
     } catch (e) { return res.status(500).json({error: 'Erro'}); }
  },

  // --- ROBÔ DE DURAÇÃO ---
  async updateOpenActivitiesDuration() {
    try {
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