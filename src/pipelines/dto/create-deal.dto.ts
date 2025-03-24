import { IsString, IsNumber, IsOptional, IsNotEmpty, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class ContactInfo {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  telegramUsername?: string;
}

export class CreateDealDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  value?: number;

  @IsString()
  @IsNotEmpty()
  stageId: string;

  @IsString()
  @IsNotEmpty()
  pipelineId: string;

  @IsString()
  @IsOptional()
  telegramChatId?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactInfo)
  contactInfo?: ContactInfo;
} 