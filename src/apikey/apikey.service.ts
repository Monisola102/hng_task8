import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes, createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KeysService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  private generateRawKey() {
    const bytes = parseInt(this.config.get('API_KEY_BYTES') || '32', 10);
    return randomBytes(bytes).toString('hex'); // full raw key
  }

  private getPrefix(rawKey: string) {
    const len = parseInt(this.config.get('API_KEY_PREFIX_LENGTH') || '8', 10);
    return rawKey.slice(0, len);
  }

  private hashKey(rawKey: string) {
    return createHash('sha256').update(rawKey).digest('hex');
  }

  async createKey(userId: string, expiresAt?: Date) {
    const raw = this.generateRawKey();        // full raw key
    const prefix = this.getPrefix(raw);       // consistent prefix
    const hash = this.hashKey(raw);           // hashed stored

    const rec = await this.prisma.apiKey.create({
      data: {
        prefix,
        keyHash: hash,
        userId,
        expiresAt: expiresAt ?? null,
      },
    });

    return {
      id: rec.id,
      prefix: rec.prefix,
      rawKey: raw, // only return ONCE
      expiresAt: rec.expiresAt,
      createdAt: rec.createdAt,
    };
  }

  async listForUser(userId: string) {
    return this.prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        prefix: true,
        expiresAt: true,
        revokedAt: true,
        createdAt: true,
      },
    });
  }

  async revokeKey(userId: string, id: string) {
    const rec = await this.prisma.apiKey.findUnique({ where: { id } });

    if (!rec || rec.userId !== userId) {
      throw new NotFoundException('API key not found');
    }

    return this.prisma.apiKey.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async validateApiKey(rawKey: string) {
    const prefix = this.getPrefix(rawKey);

    const rec = await this.prisma.apiKey.findFirst({ where: { prefix } });
    if (!rec) return null;

    if (rec.revokedAt) return null;

    if (rec.expiresAt && rec.expiresAt.getTime() < Date.now()) return null;

    const hash = this.hashKey(rawKey);
    if (hash !== rec.keyHash) return null;

    const user = await this.prisma.user.findUnique({
      where: { id: rec.userId },
    });

    return { apiKey: rec, user };
  }
}
