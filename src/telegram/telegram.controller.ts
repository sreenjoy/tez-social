import { Controller, Post, Get, Body, UseGuards, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TelegramService } from './telegram.service';
import { ConnectTelegramDto } from './dto/connect-telegram.dto';
import { LinkChatDto } from './dto/link-chat.dto';
import { VerifyTelegramDto } from './dto/verify-telegram.dto';

@Controller('telegram')
@UseGuards(JwtAuthGuard)
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('connect')
  async connectTelegram(@Body() connectDto: ConnectTelegramDto, @Request() req) {
    return this.telegramService.connectTelegram(req.user._id, connectDto);
  }

  @Post('verify')
  async verifyPhoneCode(@Body() verifyDto: VerifyTelegramDto, @Request() req) {
    return this.telegramService.verifyPhoneCode(
      req.user._id,
      verifyDto.phoneCode,
      verifyDto.password
    );
  }

  @Get('chats')
  async getUserChats(@Request() req) {
    return this.telegramService.getUserChats(req.user._id);
  }

  @Post('chats/link')
  async linkChatToDeal(@Body() linkChatDto: LinkChatDto, @Request() req) {
    return this.telegramService.linkChatToDeal(req.user._id, linkChatDto);
  }

  @Post('disconnect')
  async disconnectTelegram(@Request() req) {
    return this.telegramService.disconnectTelegram(req.user._id);
  }
} 