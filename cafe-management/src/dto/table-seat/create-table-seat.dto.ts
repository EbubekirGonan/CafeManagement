import { IsString, IsEnum, IsUUID } from 'class-validator';
import { TableStatus } from '../../enums';

export class CreateTableSeatDto {
  @IsString()
  name: string;

  @IsEnum(TableStatus)
  status: TableStatus;

  @IsUUID()
  section_id: string;
}
