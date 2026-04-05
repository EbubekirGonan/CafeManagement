import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  Req,
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
  findAll(@Req() req) {
    return this.tableSeatService.findAll(req.user.business_id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.tableSeatService.findOne(id, req.user.business_id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTableSeatDto,
    @Req() req,
  ) {
    return this.tableSeatService.update(id, dto, req.user.business_id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.tableSeatService.remove(id, req.user.business_id);
  }
}
