import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  postId?: string;
  applicationId?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  /**
   * Crea una notificación para un usuario.
   * Usado internamente por otros services (ej: applications).
   */
  async create(input: CreateNotificationInput): Promise<Notification> {
    const notification = this.notificationRepo.create(input);
    return this.notificationRepo.save(notification);
  }

  /** Lista las notificaciones del usuario, más recientes primero. */
  async listMine(userId: string, onlyUnread = false): Promise<Notification[]> {
    return this.notificationRepo.find({
      where: {
        userId,
        ...(onlyUnread ? { readAt: IsNull() } : {}),
      },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  /** Cuenta de notificaciones no leídas (para badge). */
  async countUnread(userId: string): Promise<number> {
    return this.notificationRepo.count({
      where: { userId, readAt: IsNull() },
    });
  }

  /** Marca una notificación como leída. Solo el dueño puede. */
  async markRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepo.findOneBy({ id });
    if (!notification) throw new NotFoundException('Notificación no encontrada');
    if (notification.userId !== userId) {
      throw new ForbiddenException('No puedes marcar esta notificación');
    }
    if (!notification.readAt) {
      notification.readAt = new Date();
      await this.notificationRepo.save(notification);
    }
    return notification;
  }

  /** Marca todas las notificaciones no leídas del usuario como leídas. */
  async markAllRead(userId: string): Promise<{ updated: number }> {
    const result = await this.notificationRepo.update(
      { userId, readAt: IsNull() },
      { readAt: new Date() },
    );
    return { updated: result.affected ?? 0 };
  }
}
