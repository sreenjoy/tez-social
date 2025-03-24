import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class UpdatePipelineDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  stages?: string[]; // Array of stage IDs

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 