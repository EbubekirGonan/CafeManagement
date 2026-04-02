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
import { ExpenseCategoryService } from '../services/expense-category.service';
import { CreateExpenseCategoryDto } from '../dto/expense-category/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from '../dto/expense-category/update-expense-category.dto';

@Controller('expense-categories')
export class ExpenseCategoryController {
  constructor(private readonly expenseCategoryService: ExpenseCategoryService) {}

  @Post()
  create(@Body() dto: CreateExpenseCategoryDto, @Req() req) {
    return this.expenseCategoryService.create(dto, req.user.business_id);
  }

  @Get()
  findAll(@Req() req) {
    return this.expenseCategoryService.findAll(req.user.business_id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.expenseCategoryService.findOne(id, req.user.business_id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExpenseCategoryDto,
    @Req() req,
  ) {
    return this.expenseCategoryService.update(id, dto, req.user.business_id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.expenseCategoryService.remove(id, req.user.business_id);
  }
}
