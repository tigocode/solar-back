import { Collection } from 'fireorm';

@Collection('users')
export class User {
  id!: string;
  name!: string;
  email!: string;
  password!: string; // Nota: Em produção real, senhas devem ser criptografadas (Hash).
  role!: string;     // Ex: "Gerente Operacional"
  accessLevel!: 'Admin' | 'Tec. Eletricista' | 'Zelador' | 'Mantenedor';
}