import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserSchema } from '../common/schemas/user.schema';
import { Company, CompanySchema } from '../common/schemas/company.schema';
import { Pipeline, PipelineSchema } from '../common/schemas/pipeline.schema';
import { Stage, StageSchema } from '../common/schemas/stage.schema';
import { Deal, DealSchema } from '../common/schemas/deal.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Company.name, schema: CompanySchema },
      { name: Pipeline.name, schema: PipelineSchema },
      { name: Stage.name, schema: StageSchema },
      { name: Deal.name, schema: DealSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {} 