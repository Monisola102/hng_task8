import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { KeysService } from '../apikey/apikey.service';
import { PrismaService } from '../prisma/prisma.service';
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

    const authHeader = req.headers['authorization'];
    if (
      authHeader &&
      typeof authHeader === 'string' &&
      authHeader.startsWith('Bearer ')
    ) {
      const token = authHeader.slice(7).trim();
      try {
        const payload = this.jwt.verify(token, {
          secret: this.config.get<string>('JWT_SECRET'),
        });

        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
        });
        if (!user) throw new UnauthorizedException('Invalid token');
        console.log('JWT user detected:', req.user);
        req.user = { ...user, type: 'user' };
        return true;
      } catch {
        throw new UnauthorizedException('Invalid token');
      }
    }
    const apiKeyHeader = req.headers['x-api-key'] || req.headers['x_api_key'];
    if (apiKeyHeader && typeof apiKeyHeader === 'string') {
      const keyData = await this.keysService.validateApiKey(apiKeyHeader);
      console.log('Received x-api-key:', apiKeyHeader);
      console.log('validateApiKey result:', keyData);
      if (!keyData) throw new UnauthorizedException('Invalid API key');
      req.user = {
        id: keyData.user?.id || null,
        type: 'service',
        apiKey: keyData.apiKey,
        user: keyData.user || null,
      };
      return true;
    }
    throw new UnauthorizedException('No credentials provided');
  }
}
