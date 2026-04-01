import { IsInt, IsNumber, IsUUID } from 'class-validator';

export class CreateOrderItemDto {
  @IsInt()
  quantity: number;

  @IsNumber()
  price: number;

  @IsUUID()
  session_id: string;

  @IsUUID()
  product_id: string;
}
