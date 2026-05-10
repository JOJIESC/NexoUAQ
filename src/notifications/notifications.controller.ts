import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Notification } from './entities/notification.entity';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar mis notificaciones (máximo 100, más recientes primero)' })
  @ApiQuery({ name: 'unread', required: false, type: Boolean, description: 'Solo no leídas' })
  @ApiResponse({ status: 200, type: [Notification] })
  async listMine(@Request() req, @Query('unread') unread?: string) {
    return this.notificationsService.listMine(req.user.userId, unread === 'true');
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Cuenta de notificaciones no leídas (para badge)' })
  @ApiResponse({ status: 200, schema: { example: { count: 3 } } })
  async countUnread(@Request() req) {
    const count = await this.notificationsService.countUnread(req.user.userId);
    return { count };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marcar todas mis notificaciones como leídas' })
  @ApiResponse({ status: 200, schema: { example: { updated: 5 } } })
  @HttpCode(HttpStatus.OK)
  async markAllRead(@Request() req) {
    return this.notificationsService.markAllRead(req.user.userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar una notificación como leída' })
  @HttpCode(HttpStatus.OK)
  async markRead(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.markRead(id, req.user.userId);
  }
}
