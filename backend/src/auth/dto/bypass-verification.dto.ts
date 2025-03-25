import { IsEmail, IsNotEmpty } from 'class-validator';

export class BypassVerificationDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
