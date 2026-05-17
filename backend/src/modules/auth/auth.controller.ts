import type { Request, Response } from 'express';
import type { AuthService } from './auth.service';
import { loginSchema, registerSchema } from './auth.dto';

export class AuthController {
  constructor(private readonly service: AuthService) {}

  register = async (req: Request, res: Response) => {
    const dto = registerSchema.parse(req.body);
    const result = await this.service.register(dto);
    return res.status(201).json(result);
  };

  login = async (req: Request, res: Response) => {
    const dto = loginSchema.parse(req.body);
    const result = await this.service.login(dto);
    return res.status(200).json(result);
  };

  me = async (req: Request, res: Response) => {
    return res.json({ user: req.user });
  };
}
