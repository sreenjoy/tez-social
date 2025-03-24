import { IsString, IsNotEmpty } from 'class-validator';

export class LinkChatDto {
  @IsString()
  @IsNotEmpty()
  dealId: string;

  @IsString()
  @IsNotEmpty()
  chatId: string;
} 