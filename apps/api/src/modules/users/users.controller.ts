import { Controller, Get, Put, Body, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Get user stats' })
  getStats(@CurrentUser('id') userId: string) {
    return this.usersService.getStats(userId);
  }

  @Get('me/settings')
  @ApiOperation({ summary: 'Get user settings' })
  getSettings(@CurrentUser('id') userId: string) {
    return this.usersService.getSettings(userId);
  }

  @Put('me/settings')
  @ApiOperation({ summary: 'Update user settings' })
  updateSettings(@CurrentUser('id') userId: string, @Body() body: Record<string, any>) {
    return this.usersService.updateSettings(userId, body);
  }

  @Patch('me/profile')
  @ApiOperation({ summary: 'Update user profile' })
  updateProfile(@CurrentUser('id') userId: string, @Body() body: { name?: string; timezone?: string }) {
    return this.usersService.updateProfile(userId, body);
  }
}
