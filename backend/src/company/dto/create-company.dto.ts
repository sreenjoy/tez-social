import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, ValidateIf } from 'class-validator';
import { Purpose, TeamSize, UserRole } from '../schemas/company.schema';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty({ message: 'Company name is required' })
  name: string;

  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid URL' })
  url?: string;

  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  ownerFullName: string;

  @IsEnum(TeamSize, { message: 'Please select a valid team size' })
  teamSize: TeamSize;

  @IsEnum(UserRole, { message: 'Please select a valid role' })
  ownerRole: UserRole;

  @ValidateIf(o => o.ownerRole === UserRole.OTHER)
  @IsString()
  @IsNotEmpty({ message: 'Please specify your role' })
  ownerRoleCustom?: string;

  @IsEnum(Purpose, { message: 'Please select a valid purpose' })
  purpose: Purpose;

  @ValidateIf(o => o.purpose === Purpose.OTHER)
  @IsString()
  @IsNotEmpty({ message: 'Please specify your purpose' })
  purposeCustom?: string;
} 