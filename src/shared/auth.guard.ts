import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { KeysService } from '../apikey/apikey.service.js'; // fixed relative path
import { PrismaService } from '../prisma/prisma.service.js'; // fixed relative p
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private keysService: KeysService,
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    // 1) Check Authorization Bearer token
    const auth = req.headers['authorization'];
    if (auth && typeof auth === 'string' && auth.startsWith('Bearer ')) {
      const token = auth.slice(7);
      try {
        const payload = this.jwt.verify(token, {
          secret: this.config.get<string>('JWT_SECRET'),
        });
        const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user) throw new UnauthorizedException('Invalid token');

        req.auth = { type: 'user', user };
        return true;
      } catch (err) {
        throw new UnauthorizedException('Invalid token');
      }
    }

    // 2) Check x-api-key header
    const apiKey = req.headers['x-api-key'] || req.headers['x_api_key'];
    if (apiKey && typeof apiKey === 'string') {
      const res = await this.keysService.validateApiKey(apiKey);
      if (!res) throw new UnauthorizedException('Invalid API key');

      req.auth = { type: 'service', apiKey: res.apiKey, user: res.user };
      return true;
    }

    // 3) None provided
    throw new UnauthorizedException('No credentials provided');
  }
}
