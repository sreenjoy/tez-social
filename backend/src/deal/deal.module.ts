import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DealController } from './deal.controller';
import { DealService } from './deal.service';
import { Deal, DealSchema } from './schemas/deal.schema';
import { Tag, TagSchema } from './schemas/tag.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Deal.name, schema: DealSchema },
      { name: Tag.name, schema: TagSchema },
    ]),
  ],
  controllers: [DealController],
  providers: [DealService],
  exports: [DealService],
})
export class DealModule {} 