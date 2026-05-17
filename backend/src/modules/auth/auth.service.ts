import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { PrismaClient } from '@prisma/client';
import { env } from '../../config/env';
import { ConflictError, UnauthorizedError } from '../../common/errors';
import type { LoginDto, RegisterDto } from './auth.dto';

const BCRYPT_ROUNDS = 10;

export class AuthService {
  constructor(private readonly prisma: PrismaClient) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        displayName: dto.displayName,
      },
    });

    return this.toAuthResponse(user.id, user.email, user.displayName);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return this.toAuthResponse(user.id, user.email, user.displayName);
  }

  private toAuthResponse(id: string, email: string, displayName: string | null) {
    const token = jwt.sign({ sub: id, email }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as SignOptions);
    return {
      token,
      user: { id, email, displayName },
    };
  }
}
