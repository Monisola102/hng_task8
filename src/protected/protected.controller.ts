import { Controller, Get, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from 'src/shared/auth.guard';

@Controller()
export class ProtectedController {

  // JWT-protected user route
  @UseGuards(AuthGuard)
  @Get('profile')
  profile(@Req() req: any) {
    // Guard should attach req.user and req.type
    if (req.type !== 'user') {
      throw new ForbiddenException('Only users can access profile');
    }

    const { id, email, name } = req.user;
    return { id, email, name };
  }

  // API key protected service route
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
