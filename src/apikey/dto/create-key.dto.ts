
 import { IsOptional, IsISO8601 } from 'class-validator';
 export class CreateKeyDto {
 @IsOptional()
 @IsISO8601()
 expiresAt?: string; // ISO date string
 }