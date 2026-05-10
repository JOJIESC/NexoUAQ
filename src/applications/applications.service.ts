import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from './entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { Post } from '../posts/entities/post.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly appRepo: Repository<Application>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    private readonly notificationsService: NotificationsService,
  ) {}

  // 1. APLICAR A UN PROYECTO
  async apply(postId: string, applicantId: string, dto: CreateApplicationDto) {
    // A. Verificar que el post existe
    const post = await this.postRepo.findOneBy({ id: postId });
    if (!post) throw new NotFoundException('El proyecto no existe');

    // B. Verificar que no sea su propio proyecto
    if (post.authorId === applicantId) {
      throw new BadRequestException('No puedes aplicar a tu propio proyecto');
    }

    // C. Verificar si ya aplicó antes
    const existing = await this.appRepo.findOne({
      where: { postId, applicantId },
    });
    if (existing) throw new BadRequestException('Ya has aplicado a este proyecto');

    // D. Crear solicitud
    const application = this.appRepo.create({
      postId,
      applicantId,
      message: dto.message,
    });

    const saved = await this.appRepo.save(application);

    // E. Notificar al dueño del post
    // Cargamos la app con el applicant (eager: true) para obtener su nombre
    const withApplicant = await this.appRepo.findOne({
      where: { id: saved.id },
      relations: ['applicant'],
    });
    const applicantName = withApplicant?.applicant
      ? `${withApplicant.applicant.name} ${withApplicant.applicant.lastname}`.trim()
      : 'Un estudiante';

    // No bloqueamos la respuesta si la notificación falla
    this.notificationsService
      .create({
        userId: post.authorId,
        type: NotificationType.APPLICATION_RECEIVED,
        title: 'Nueva postulación',
        message: `${applicantName} se postuló a tu publicación "${post.title}"`,
        postId: post.id,
        applicationId: saved.id,
      })
      .catch((err) => console.error('Error creando notificación:', err));

    return saved;
  }

  // 2. VER CANDIDATOS (Solo para el dueño del proyecto)
  async findCandidates(postId: string, userId: string) {
    const post = await this.postRepo.findOneBy({ id: postId });
    if (!post) throw new NotFoundException('Proyecto no encontrado');

    if (post.authorId !== userId) {
      throw new ForbiddenException('No tienes permiso para ver los candidatos de este proyecto');
    }

    return await this.appRepo.find({
      where: { postId },
      relations: ['applicant'], // Traer datos del alumno
    });
  }

  // 3. ACEPTAR/RECHAZAR (Solo dueño)
  async updateStatus(applicationId: string, userId: string, status: ApplicationStatus) {
    const app = await this.appRepo.findOne({
      where: { id: applicationId },
      relations: ['post'], // Necesitamos el post para ver quién es el dueño
    });

    if (!app) throw new NotFoundException('Solicitud no encontrada');

    if (app.post.authorId !== userId) {
      throw new ForbiddenException('No eres el dueño de este proyecto');
    }

    app.status = status;
    const saved = await this.appRepo.save(app);

    // Notificar al postulante del cambio de estado
    const accepted = status === ApplicationStatus.ACCEPTED;
    this.notificationsService
      .create({
        userId: app.applicantId,
        type: accepted
          ? NotificationType.APPLICATION_ACCEPTED
          : NotificationType.APPLICATION_REJECTED,
        title: accepted ? 'Postulación aceptada' : 'Postulación rechazada',
        message: accepted
          ? `Tu postulación a "${app.post.title}" fue aceptada 🎉`
          : `Tu postulación a "${app.post.title}" fue rechazada`,
        postId: app.postId,
        applicationId: app.id,
      })
      .catch((err) => console.error('Error creando notificación:', err));

    return saved;
  }
}
