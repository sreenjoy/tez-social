import { Controller, Post, Body, Get, Param, UseGuards, Request, Logger, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto';

@Controller('company')
export class CompanyController {
  private readonly logger = new Logger(CompanyController.name);

  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createCompanyDto: CreateCompanyDto, @Request() req) {
    this.logger.log(`Creating company for user ${req.user.sub}`);
    return this.companyService.create(createCompanyDto, req.user.sub);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCompanyForUser(@Request() req) {
    const company = await this.companyService.findByUserId(req.user.sub);
    
    if (!company) {
      throw new NotFoundException('No company found for this user');
    }
    
    return company;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getCompanyById(@Param('id') id: string) {
    return this.companyService.findById(id);
  }
} 