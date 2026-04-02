import { IsString, IsNumber, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  name: string;

  @IsUUID()
  @IsOptional()
  expense_category_id?: string;

  @IsString()
  unit: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  amount: number;

  @IsDateString()
  date: string;
}
