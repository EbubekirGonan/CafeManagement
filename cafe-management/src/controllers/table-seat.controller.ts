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
import { TableSeatService } from '../services/table-seat.service';
import { CreateTableSeatDto } from '../dto/table-seat/create-table-seat.dto';
import { UpdateTableSeatDto } from '../dto/table-seat/update-table-seat.dto';

@Controller('table-seats')
export class TableSeatController {
  constructor(private readonly tableSeatService: TableSeatService) {}

  @Post()
  create(@Body() dto: CreateTableSeatDto) {
    return this.tableSeatService.create(dto);
  }

  @Get()
  findAll() {
    return this.tableSeatService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tableSeatService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTableSeatDto,
  ) {
    return this.tableSeatService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tableSeatService.remove(id);
  }
}
