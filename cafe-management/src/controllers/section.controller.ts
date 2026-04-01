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
import { SectionService } from '../services/section.service';
import { CreateSectionDto } from '../dto/section/create-section.dto';
import { UpdateSectionDto } from '../dto/section/update-section.dto';

@Controller('sections')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Post()
  create(@Body() dto: CreateSectionDto, @Req() req) {
    return this.sectionService.create(dto, req.user.business_id);
  }

  @Get()
  findAll(@Req() req) {
    return this.sectionService.findAll(req.user.business_id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.sectionService.findOne(id, req.user.business_id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSectionDto,
    @Req() req,
  ) {
    return this.sectionService.update(id, dto, req.user.business_id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.sectionService.remove(id, req.user.business_id);
  }
}
