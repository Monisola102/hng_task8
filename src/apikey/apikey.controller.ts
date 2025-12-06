import { Controller, Post, Body, Req, UseGuards, Get, Param, ForbiddenException } from '@nestjs/common'
import { KeysService } from './apikey.service';
import { CreateKeyDto } from './dto/create-key.dto';
import { AuthGuard } from '../shared/auth.guard';

@Controller('keys')
export class KeysController {
  constructor(private keys: KeysService) {}

  @UseGuards(AuthGuard)
  @Post('create')
  async create(@Req() req: any, @Body() dto: CreateKeyDto) {
    if (req.user?.type !== 'user')
      throw new ForbiddenException('Only users can create keys');

    const userId = req.user.id;

    const key = await this.keys.createKey(
      userId,
      dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    );

    return key; // raw key returned only once
  }

  @UseGuards(AuthGuard)
  @Get('list')
  async list(@Req() req: any) {
    if (req.user?.type !== 'user')
      throw new ForbiddenException('Only users can list keys');

    return this.keys.listForUser(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Post('revoke/:id')
  async revoke(@Req() req: any, @Param('id') id: string) {
    if (req.user?.type !== 'user')
      throw new ForbiddenException('Only users can revoke keys');

    return this.keys.revokeKey(req.user.id, id);
  }
}
