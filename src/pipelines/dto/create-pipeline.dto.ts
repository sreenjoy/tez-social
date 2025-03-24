import { IsString, IsOptional, IsNotEmpty, IsArray } from 'class-validator';

export class CreatePipelineDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  stages?: string[]; // Array of stage IDs
} 