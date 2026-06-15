import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('alerts')
@Controller('alerts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Get alerts for current user' })
  getAlerts(
    @CurrentUser('id') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.alertsService.getAlertsForUser(userId, +page, +limit);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread alerts count' })
  getUnreadCount(@CurrentUser('id') userId: string) {
    return this.alertsService.getUnreadCount(userId).then(count => ({ count }));
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark alert as read' })
  markAsRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.alertsService.markAsRead(id, userId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all alerts as read' })
  markAllAsRead(@CurrentUser('id') userId: string) {
    return this.alertsService.markAllAsRead(userId);
  }
}
