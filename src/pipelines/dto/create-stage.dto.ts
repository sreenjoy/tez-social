import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateStageDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsString()
  @IsNotEmpty()
  pipelineId: string; // The pipeline this stage belongs to
} 