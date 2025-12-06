 import { Module } from '@nestjs/common';
 import { ProtectedController } from './protected.controller.js';
 import { AuthModule } from '../auth/auth.module';
 import { KeysModule } from '../apikey/apikey.module';
 import { PrismaModule } from '../prisma/prisma.module';
 @Module({
 imports: [AuthModule, KeysModule, PrismaModule],
 controllers: [ProtectedController],
 })
 export class ProtectedModule {}
 