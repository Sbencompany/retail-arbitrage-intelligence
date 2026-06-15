import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import * as nodemailer from 'nodemailer';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);
  private emailTransport: nodemailer.Transporter | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.initEmailTransport();
  }

  private initEmailTransport() {
    const host = this.config.get('SMTP_HOST');
    const user = this.config.get('SMTP_USER');
    const pass = this.config.get('SMTP_PASS');

    if (host && user && pass) {
      this.emailTransport = nodemailer.createTransport({
        host,
        port: this.config.get<number>('SMTP_PORT', 587),
        secure: this.config.get('SMTP_SECURE') === 'true',
        auth: { user, pass },
      });
      this.logger.log('Email transport initialized');
    } else {
      this.logger.warn('SMTP not configured. Email alerts disabled.');
    }
  }

  async createAlert(params: {
    userId: string;
    opportunityId?: string;
    type: string;
    channel: string;
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }) {
    return this.prisma.alert.create({
      data: {
        userId: params.userId,
        opportunityId: params.opportunityId,
        type: params.type as any,
        channel: params.channel as any,
        title: params.title,
        message: params.message,
        metadata: params.metadata,
      },
    });
  }

  async sendAlert(alertId: string) {
    const alert = await this.prisma.alert.findUnique({
      where: { id: alertId },
      include: { user: { include: { settings: true } } },
    });
    if (!alert || alert.isSent) return;

    const { user } = alert;
    const settings = user.settings;

    let sent = false;

    if (alert.channel === 'EMAIL' && settings?.alertEmail) {
      sent = await this.sendEmail(user.email, alert.title, alert.message);
    } else if (alert.channel === 'TELEGRAM' && settings?.alertTelegram && settings.telegramChatId) {
      sent = await this.sendTelegram(settings.telegramChatId, alert.title, alert.message);
    } else if (alert.channel === 'WHATSAPP' && settings?.alertWhatsapp && settings.whatsappNumber) {
      sent = await this.sendWhatsapp(settings.whatsappNumber, alert.title, alert.message);
    } else if (alert.channel === 'IN_APP') {
      // In-app alerts are created in DB and pushed via WebSocket
      await this.prisma.notification.create({
        data: {
          userId: user.id,
          title: alert.title,
          message: alert.message,
          type: alert.type,
          metadata: alert.metadata as any,
        },
      });
      sent = true;
    }

    if (sent) {
      await this.prisma.alert.update({
        where: { id: alertId },
        data: { isSent: true, sentAt: new Date() },
      });
    }
  }

  private async sendEmail(to: string, subject: string, text: string): Promise<boolean> {
    if (!this.emailTransport) {
      this.logger.warn('Email transport not initialized');
      return false;
    }
    try {
      await this.emailTransport.sendMail({
        from: this.config.get('EMAIL_FROM', 'RAI Platform <noreply@retailarbitrage.com>'),
        to,
        subject,
        text,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🏪 Retail Arbitrage Alert</h2>
          <h3>${subject}</h3>
          <p>${text.replace(/\n/g, '<br>')}</p>
          <hr>
          <small style="color: #6b7280;">Retail Arbitrage Intelligence Platform</small>
        </div>`,
      });
      return true;
    } catch (error) {
      this.logger.error('Email send failed: ' + error.message);
      return false;
    }
  }

  private async sendTelegram(chatId: string, title: string, message: string): Promise<boolean> {
    const token = this.config.get('TELEGRAM_BOT_TOKEN');
    if (!token) { this.logger.warn('Telegram bot token not configured'); return false; }
    try {
      await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text: `🚨 *${title}*\n\n${message}`,
        parse_mode: 'Markdown',
      });
      return true;
    } catch (error) {
      this.logger.error('Telegram send failed: ' + error.message);
      return false;
    }
  }

  private async sendWhatsapp(to: string, title: string, message: string): Promise<boolean> {
    const sid = this.config.get('TWILIO_ACCOUNT_SID');
    const authToken = this.config.get('TWILIO_AUTH_TOKEN');
    const from = this.config.get('TWILIO_WHATSAPP_FROM');
    if (!sid || !authToken || !from) { this.logger.warn('Twilio not configured'); return false; }
    try {
      await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
        new URLSearchParams({
          From: from,
          To: `whatsapp:${to}`,
          Body: `🚨 *${title}*\n${message}`,
        }),
        { auth: { username: sid, password: authToken } }
      );
      return true;
    } catch (error) {
      this.logger.error('WhatsApp send failed: ' + error.message);
      return false;
    }
  }

  async getAlertsForUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [alerts, total] = await Promise.all([
      this.prisma.alert.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
        include: { opportunity: { include: { product: true } } },
      }),
      this.prisma.alert.count({ where: { userId } }),
    ]);
    return { data: alerts, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async markAsRead(alertId: string, userId: string) {
    return this.prisma.alert.updateMany({
      where: { id: alertId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.alert.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.alert.count({ where: { userId, isRead: false } });
  }

  async notifyNewOpportunity(userId: string, opportunity: any) {
    const channels = ['IN_APP', 'EMAIL'];
    const title = `🎯 New Opportunity: ${opportunity.product?.title?.substring(0, 50)}`;
    const message = `ROI: ${opportunity.estimatedRoi.toFixed(1)}% | Profit: $${opportunity.estimatedProfit.toFixed(2)} | Score: ${opportunity.overallScore.toFixed(0)}/100\n\nStore: ${opportunity.retailStoreName}\nBuy: $${opportunity.buyPrice} → Sell: $${opportunity.sellPrice}`;

    for (const channel of channels) {
      const alert = await this.createAlert({
        userId, opportunityId: opportunity.id,
        type: 'NEW_OPPORTUNITY', channel,
        title, message,
        metadata: { opportunityId: opportunity.id, roi: opportunity.estimatedRoi },
      });
      await this.sendAlert(alert.id);
    }
  }
}
