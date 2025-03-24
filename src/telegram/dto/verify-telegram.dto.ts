import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class VerifyTelegramDto {
  @IsString()
  @IsNotEmpty()
  phoneCode: string;

  @IsString()
  @IsOptional()
  password?: string; // For 2FA authentication if required
} 