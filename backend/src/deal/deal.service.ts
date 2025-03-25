import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Deal } from './schemas/deal.schema';
import { Tag } from './schemas/tag.schema';

@Injectable()
export class DealService {
  private readonly logger = new Logger(DealService.name);

  constructor(
    @InjectModel(Deal.name) private dealModel: Model<Deal>,
    @InjectModel(Tag.name) private tagModel: Model<Tag>,
  ) {}

  async findDealsByStage(stageId: string): Promise<Deal[]> {
    try {
      if (!Types.ObjectId.isValid(stageId)) {
        throw new BadRequestException('Invalid stage ID');
      }
      
      return this.dealModel.find({ 
        stageId,
        isActive: true 
      }).populate('tags').sort({ updatedAt: -1 }).exec();
    } catch (error) {
      this.logger.error(`Failed to find deals for stage ${stageId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findDealsByPipeline(pipelineId: string): Promise<Deal[]> {
    try {
      if (!Types.ObjectId.isValid(pipelineId)) {
        throw new BadRequestException('Invalid pipeline ID');
      }
      
      return this.dealModel.find({ 
        pipelineId,
        isActive: true 
      }).populate('tags').sort({ updatedAt: -1 }).exec();
    } catch (error) {
      this.logger.error(`Failed to find deals for pipeline ${pipelineId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findDealById(id: string): Promise<Deal> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid deal ID');
      }
      
      const deal = await this.dealModel.findById(id)
        .populate('tags')
        .populate('assignedTo')
        .exec();
      
      if (!deal || !deal.isActive) {
        throw new NotFoundException('Deal not found');
      }
      
      return deal;
    } catch (error) {
      this.logger.error(`Failed to find deal by ID ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createDeal(dealData: Partial<Deal>): Promise<Deal> {
    try {
      const deal = new this.dealModel(dealData);
      return await deal.save();
    } catch (error) {
      this.logger.error(`Failed to create deal: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateDeal(id: string, updateData: Partial<Deal>): Promise<Deal> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid deal ID');
      }
      
      const deal = await this.dealModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).populate('tags').exec();
      
      if (!deal) {
        throw new NotFoundException('Deal not found');
      }
      
      return deal;
    } catch (error) {
      this.logger.error(`Failed to update deal ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async moveToStage(id: string, stageId: string): Promise<Deal> {
    try {
      if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(stageId)) {
        throw new BadRequestException('Invalid deal ID or stage ID');
      }
      
      const deal = await this.dealModel.findByIdAndUpdate(
        id,
        { stageId },
        { new: true }
      ).populate('tags').exec();
      
      if (!deal) {
        throw new NotFoundException('Deal not found');
      }
      
      return deal;
    } catch (error) {
      this.logger.error(`Failed to move deal ${id} to stage ${stageId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteDeal(id: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid deal ID');
      }
      
      // Soft delete by marking as inactive
      const deal = await this.dealModel.findByIdAndUpdate(
        id,
        { isActive: false }
      );
      
      if (!deal) {
        throw new NotFoundException('Deal not found');
      }
    } catch (error) {
      this.logger.error(`Failed to delete deal ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findTagsByCompany(companyId: string): Promise<Tag[]> {
    try {
      if (!Types.ObjectId.isValid(companyId)) {
        throw new BadRequestException('Invalid company ID');
      }
      
      return this.tagModel.find({ 
        companyId,
        isActive: true 
      }).sort({ name: 1 }).exec();
    } catch (error) {
      this.logger.error(`Failed to find tags for company ${companyId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createTag(tagData: Partial<Tag>): Promise<Tag> {
    try {
      const tag = new this.tagModel(tagData);
      return await tag.save();
    } catch (error) {
      this.logger.error(`Failed to create tag: ${error.message}`, error.stack);
      throw error;
    }
  }
} 