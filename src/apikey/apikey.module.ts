 import { Module } from '@nestjs/common';
 import { KeysController } from './apikey.controller';
 import { KeysService } from './apikey.service';
 import { PrismaModule } from '../prisma/prisma.module';
 import { ConfigModule } from '@nestjs/config';
 import { JwtModule } from '@nestjs/jwt';

 @Module({
 imports: [PrismaModule, ConfigModule, JwtModule],
 controllers: [KeysController],
 providers: [KeysService],
 exports: [KeysService],
 
})
 export class KeysModule {}
