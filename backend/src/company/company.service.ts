import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Company } from './schemas/company.schema';
import { User } from '../auth/schemas/user.schema';
import { CreateCompanyDto } from './dto';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(
    @InjectModel(Company.name) private companyModel: Model<Company>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto, userId: string): Promise<Company> {
    try {
      this.logger.log(`Creating company for user ${userId}`);
      
      // Create the company
      const company = new this.companyModel({
        ...createCompanyDto,
        members: [userId],
      });
      
      const savedCompany = await company.save();
      
      // Update user with company reference and mark onboarding as completed
      await this.userModel.findByIdAndUpdate(
        userId,
        { 
          companyId: savedCompany._id,
          hasCompletedOnboarding: true 
        }
      );
      
      return savedCompany;
    } catch (error) {
      this.logger.error(`Failed to create company: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findById(id: string): Promise<Company> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new NotFoundException('Invalid company ID');
      }
      
      const company = await this.companyModel.findById(id);
      
      if (!company) {
        throw new NotFoundException('Company not found');
      }
      
      return company;
    } catch (error) {
      this.logger.error(`Failed to find company by ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Company | null> {
    try {
      // First find the user to get their company ID
      const user = await this.userModel.findById(userId);
      
      if (!user || !user.companyId) {
        return null;
      }
      
      return this.findById(user.companyId.toString());
    } catch (error) {
      this.logger.error(`Failed to find company for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, updateData: Partial<Company>): Promise<Company> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new NotFoundException('Invalid company ID');
      }
      
      const company = await this.companyModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      if (!company) {
        throw new NotFoundException('Company not found');
      }
      
      return company;
    } catch (error) {
      this.logger.error(`Failed to update company ${id}: ${error.message}`);
      throw error;
    }
  }

  async addMember(companyId: string, userId: string): Promise<Company> {
    try {
      const company = await this.companyModel.findByIdAndUpdate(
        companyId,
        { $addToSet: { members: userId } },
        { new: true }
      );
      
      if (!company) {
        throw new NotFoundException('Company not found');
      }
      
      // Update user with company reference
      await this.userModel.findByIdAndUpdate(
        userId,
        { companyId: company._id }
      );
      
      return company;
    } catch (error) {
      this.logger.error(`Failed to add member ${userId} to company ${companyId}: ${error.message}`);
      throw error;
    }
  }
} 