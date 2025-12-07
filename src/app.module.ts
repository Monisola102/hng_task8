import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { KeysModule } from './apikey/apikey.module';
import { ProtectedModule } from './protected/protected.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), 
PrismaModule, AuthModule, KeysModule, ProtectedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
