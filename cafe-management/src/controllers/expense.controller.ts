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
import { ExpenseService } from '../services/expense.service';
import { CreateExpenseDto } from '../dto/expense/create-expense.dto';
import { UpdateExpenseDto } from '../dto/expense/update-expense.dto';

@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  create(@Body() dto: CreateExpenseDto, @Req() req) {
    return this.expenseService.create(dto, req.user.business_id);
  }

  @Get()
  findAll(@Req() req) {
    return this.expenseService.findAll(req.user.business_id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.expenseService.findOne(id, req.user.business_id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExpenseDto,
    @Req() req,
  ) {
    return this.expenseService.update(id, dto, req.user.business_id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.expenseService.remove(id, req.user.business_id);
  }
}
