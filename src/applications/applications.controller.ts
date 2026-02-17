import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApplicationStatus } from './entities/application.entity';

@ApiTags('Applications (Colaboraciones)')
@UseGuards(AuthGuard('jwt')) // Todo el módulo protegido
@ApiBearerAuth()
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly appsService: ApplicationsService) {}

  @Post(':postId')
  @ApiOperation({ summary: 'Postularse a un proyecto' })
  apply(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() dto: CreateApplicationDto,
    @Request() req,
  ) {
    return this.appsService.apply(postId, req.user.userId, dto);
  }

  @Get('post/:postId')
  @ApiOperation({ summary: 'Ver candidatos de mi proyecto (Solo Dueño)' })
  findCandidates(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Request() req,
  ) {
    return this.appsService.findCandidates(postId, req.user.userId);
  }

  @Patch(':id/accept')
  @ApiOperation({ summary: 'Aceptar una solicitud' })
  accept(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.appsService.updateStatus(id, req.user.userId, ApplicationStatus.ACCEPTED);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Rechazar una solicitud' })
  reject(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.appsService.updateStatus(id, req.user.userId, ApplicationStatus.REJECTED);
  }
}