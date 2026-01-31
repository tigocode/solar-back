import { Collection } from 'fireorm';

@Collection('activities')
export class Activity {
  id!: string;
  titulo!: string;
  categoria!: string;
  subcategoria!: string; // Pode ser vazia
  data!: string;         // Formato YYYY-MM-DD
  duracao!: string;      // Ex: "2h 30m"
  descricao!: string;
  status!: 'aberta' | 'finalizada';
  fotos!: string[];      // Array de URLs ou Base64
}