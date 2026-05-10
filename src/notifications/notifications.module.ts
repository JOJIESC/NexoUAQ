import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  // Exportamos el service para que ApplicationsModule pueda inyectarlo
  // y crear notificaciones cuando alguien aplica/acepta/rechaza.
  exports: [NotificationsService],
})
export class NotificationsModule {}
