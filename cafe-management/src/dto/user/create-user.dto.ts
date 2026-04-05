import { IsString, IsEmail, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { UserRole } from '../../enums';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsUUID()
  businessId: string;
}
