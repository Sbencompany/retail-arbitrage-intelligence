import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { settings: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...safe } = user;
    return safe;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  async updateProfile(id: string, data: { name?: string; avatarUrl?: string; timezone?: string }) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async updateSettings(userId: string, settings: Record<string, any>) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      update: settings,
      create: { userId, ...settings },
    });
  }

  async getSettings(userId: string) {
    return this.prisma.userSettings.findUnique({ where: { userId } });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) throw new NotFoundException('User not found');
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new Error('Current password is incorrect');
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  async getStats(userId: string) {
    const [opportunities, alerts, watchlistItems] = await Promise.all([
      this.prisma.opportunity.count({ where: { status: 'ACTIVE' } }),
      this.prisma.alert.count({ where: { userId, isRead: false } }),
      this.prisma.watchlistItem.count({ where: { watchlist: { userId } } }),
    ]);
    return { opportunities, unreadAlerts: alerts, watchlistItems };
  }
}
