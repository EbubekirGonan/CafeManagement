import { IsString, IsEmail, IsEnum } from 'class-validator';
import { UserRole } from '../../enums';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password_hash: string;

  @IsEnum(UserRole)
  role: UserRole;
}
