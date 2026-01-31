import { Collection } from 'fireorm';

@Collection('items')
export class Item {
  id!: string;
  equipamento!: string;
  modelo!: string;
  fabricante!: string;
  qtd!: number;
  local!: string;
  caracteristicas!: string;
}