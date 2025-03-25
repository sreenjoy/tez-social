import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateStageDto {
  @IsString()
  @IsNotEmpty({ message: 'Stage name is required' })
  name: string;
  
  @IsNumber()
  @IsNotEmpty({ message: 'Stage order is required' })
  order: number;
  
  @IsOptional()
  @IsString()
  color?: string;
} 