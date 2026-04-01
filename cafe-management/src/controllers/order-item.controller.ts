import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OrderItemService } from '../services/order-item.service';
import { CreateOrderItemDto } from '../dto/order-item/create-order-item.dto';
import { UpdateOrderItemDto } from '../dto/order-item/update-order-item.dto';

@Controller('order-items')
export class OrderItemController {
  constructor(private readonly orderItemService: OrderItemService) {}

  @Post()
  create(@Body() dto: CreateOrderItemDto) {
    return this.orderItemService.create(dto);
  }

  @Get()
  findAll() {
    return this.orderItemService.findAll();
  }

  @Get('session/:sessionId')
  findBySession(@Param('sessionId', ParseUUIDPipe) sessionId: string) {
    return this.orderItemService.findBySession(sessionId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderItemService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderItemDto,
  ) {
    return this.orderItemService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderItemService.remove(id);
  }
}
