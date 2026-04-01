import { IsUUID } from 'class-validator';

export class CreateSessionDto {
  @IsUUID()
  table_id: string;
}
