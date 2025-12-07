import { Controller, Get, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from 'src/shared/auth.guard';

@Controller()
export class ProtectedController {
  @UseGuards(AuthGuard)
  @Get('profile')
  profile(@Req() req: any) {
    if (req.type !== 'user') {
      throw new ForbiddenException('Only users can access profile');
    }
    const { id, email, name } = req.user;
    return { id, email, name };
  }
  @UseGuards(AuthGuard)
  @Get('service/ping')
  ping(@Req() req: any) {
    if (req.type !== 'service') {
      throw new ForbiddenException('Only services can access this route');
    }

    return {
      ok: true,
      serviceOwner: req.user.email,
      keyPrefix: req.apiKey.prefix,
    };
  }
}
