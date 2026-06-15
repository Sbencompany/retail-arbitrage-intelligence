import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: { id: string; email: string; name: string; role: string; plan: string };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<TokenPair> {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (exists) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
        settings: { create: { minRoi: 30, minProfit: 10, maxBudget: 1000 } },
        watchlists: { create: { name: 'My Watchlist', isDefault: true } },
      },
    });

    this.logger.log(`New user registered: ${user.email}`);
    return this.generateTokens(user);
  }

  async login(email: string, password: string): Promise<TokenPair> {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    this.logger.log(`User logged in: ${email}`);
    return this.generateTokens(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.passwordHash) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;
    if (!user.isActive) throw new UnauthorizedException('Account disabled');
    return user;
  }

  async googleLogin(profile: any): Promise<TokenPair> {
    let user = await this.prisma.user.findUnique({ where: { email: profile.email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          emailVerified: true,
          settings: { create: {} },
          watchlists: { create: { name: 'My Watchlist', isDefault: true } },
          oauthAccounts: {
            create: {
              provider: 'google',
              providerAccountId: profile.providerId,
              accessToken: profile.accessToken,
            },
          },
        },
      });
    }
    return this.generateTokens(user);
  }

  async refreshTokens(userId: string): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) throw new UnauthorizedException('User not found');
    return this.generateTokens(user);
  }

  async logout(userId: string, token: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { userId, token } });
  }

  private generateTokens(user: any): TokenPair {
    const payload = { sub: user.id, email: user.email, role: user.role, plan: user.plan };
    const expiresIn = 900; // 15 min
    return {
      accessToken: this.jwt.sign(payload),
      refreshToken: this.jwt.sign(payload, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
      expiresIn,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, plan: user.plan },
    };
  }
}
