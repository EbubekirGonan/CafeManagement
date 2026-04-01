import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SessionService } from '../services/session.service';
import { CreateSessionDto } from '../dto/session/create-session.dto';
import { UpdateSessionDto } from '../dto/session/update-session.dto';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.sessionService.create(dto);
  }

  @Get()
  findAll(@Query('status') status?: string) {
    return this.sessionService.findAll(status);
  }

  @Get('table/:tableId/active')
  findActiveByTable(@Param('tableId', ParseUUIDPipe) tableId: string) {
    return this.sessionService.findActiveByTable(tableId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionService.findOne(id);
  }

  @Patch(':id/close')
  closeSession(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionService.closeSession(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.sessionService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionService.remove(id);
  }
}
