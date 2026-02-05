import { Collection } from 'fireorm';

@Collection('activities')
export class Activity {
  id!: string;
  titulo!: string;
  categoria!: string;
  subcategoria!: string; 
  setor!: string;        // <--- NOVO: Para Roçada (Superior, Central...)
  data!: string;         // Data do agendamento (YYYY-MM-DD)
  createdAt!: string;    // <--- NOVO: Data/Hora exata da criação (ISO)
  duracao!: string;      // Calculado automaticamente
  descricao!: string;
  status!: 'aberta' | 'finalizada';
  fotos!: string[];

  // --- NOVOS CAMPOS DE USUÁRIO ---
  userId!: string;       // ID do dono da atividade
  userName!: string;     // Nome do dono (para facilitar exibição)
}