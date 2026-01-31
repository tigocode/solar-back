import { Collection } from 'fireorm';

@Collection('categories') // Nome da coleção no Firestore
export class Category {
  id!: string; // FireORM gerencia o ID automaticamente se não passar
  nome!: string;
  subcategorias!: string[]; // Array de strings simples: ["Setor A", "Setor B"]
}