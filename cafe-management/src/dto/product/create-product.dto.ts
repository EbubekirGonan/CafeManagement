import { IsString, IsNumber, IsUUID } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsUUID()
  category_id: string;
}
