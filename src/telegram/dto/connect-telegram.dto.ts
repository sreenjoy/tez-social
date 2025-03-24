import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ConnectTelegramDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  phoneCode?: string;

  @IsString()
  @IsOptional()
  password?: string; // For 2FA authentication if required
} 