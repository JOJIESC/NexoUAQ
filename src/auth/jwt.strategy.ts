import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // 1. Extraemos el token del Header 'Authorization: Bearer <token>'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Si el token expiró, lanza 401 Unauthorized
      // 2. Usamos la misma clave secreta que en AuthModule
      secretOrKey: configService.get<string>('JWT_SECRET') || 'ESTO_ES_UN_SECRETO_TEMPORAL',
    });
  }

  // 3. Validación automática: Si el token es real, esto devuelve los datos del usuario
  async validate(payload: any) {
    // Esto inyecta el objeto 'user' en la request (req.user)
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}