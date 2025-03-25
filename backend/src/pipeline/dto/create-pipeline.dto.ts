import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePipelineDto {
  @IsString()
  @IsNotEmpty({ message: 'Pipeline name is required' })
  name: string;
  
  @IsOptional()
  @IsString()
  description?: string;
  
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
} 