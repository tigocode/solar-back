import { Request, Response } from 'express';
import { getRepository } from 'fireorm';
import { User } from '../models/user';

export const UserController = {
  
  // Listar todos (Para a tela de Equipe)
  async index(req: Request, res: Response) {
    try {
      const repo = getRepository(User);
      const users = await repo.find();
      // Remove a senha antes de enviar para o front por segurança
      const safeUsers = users.map(({ password, ...u }) => u);
      return res.json(safeUsers);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  },

  // Criar Usuário
  async create(req: Request, res: Response) {
    try {
      const { name, email, password, role, accessLevel } = req.body;
      const repo = getRepository(User);

      // Verifica se já existe email
      const existing = await repo.whereEqualTo('email', email).findOne();
      if (existing) return res.status(400).json({ error: 'Email já cadastrado' });

      const user = new User();
      user.name = name;
      user.email = email;
      user.password = password;
      user.role = role;
      user.accessLevel = accessLevel;

      const saved = await repo.create(user);
      return res.json(saved);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  },

  // Login (Verifica email e senha)
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const repo = getRepository(User);
      
      // Busca usuário pelo email
      const user = await repo.whereEqualTo('email', email).findOne();

      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Retorna os dados do usuário (sem a senha)
      const { password: _, ...userData } = user; 
      return res.json(userData);

    } catch (error) {
      return res.status(500).json({ error: 'Erro no login' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await getRepository(User).delete(id);
      return res.status(204).send();
    } catch (e) { return res.status(500).json({error: 'Erro'}); }
  },
  
  async update(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const data = req.body;
        const repo = getRepository(User);
        const user = await repo.findById(id);
        if(!user) return res.status(404).json({error: 'User not found'});
        
        Object.assign(user, data);
        await repo.update(user);
        return res.json(user);
    } catch (e) { return res.status(500).json({error: 'Erro'}); }
  }
};