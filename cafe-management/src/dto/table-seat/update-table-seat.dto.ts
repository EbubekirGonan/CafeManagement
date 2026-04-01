import { PartialType } from '@nestjs/mapped-types';
import { CreateTableSeatDto } from './create-table-seat.dto';

export class UpdateTableSeatDto extends PartialType(CreateTableSeatDto) {}
