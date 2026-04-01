import { IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  name: string;

  @IsString()
  expense_category: string;

  @IsString()
  unit: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  amount: number;

  @IsDateString()
  date: string;
}
