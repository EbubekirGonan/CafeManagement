import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableSeat } from '../entities/table-seat.entity';
import { CreateTableSeatDto } from '../dto/table-seat/create-table-seat.dto';
import { UpdateTableSeatDto } from '../dto/table-seat/update-table-seat.dto';

@Injectable()
export class TableSeatService {
  constructor(
    @InjectRepository(TableSeat)
    private readonly tableSeatRepository: Repository<TableSeat>,
  ) {}

  create(dto: CreateTableSeatDto) {
    const tableSeat = this.tableSeatRepository.create(dto);
    return this.tableSeatRepository.save(tableSeat);
  }

  findAll() {
    return this.tableSeatRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const tableSeat = await this.tableSeatRepository.findOneBy({ id });
    if (!tableSeat) throw new NotFoundException('TableSeat not found');
    return tableSeat;
  }

  async update(id: string, dto: UpdateTableSeatDto) {
    await this.findOne(id);
    await this.tableSeatRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.tableSeatRepository.delete(id);
  }
}
