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

  findAll(business_id: string) {
    return this.tableSeatRepository.find({
      where: { section: { business_id } },
      relations: { section: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, business_id: string) {
    const tableSeat = await this.tableSeatRepository.findOne({
      where: { id, section: { business_id } },
      relations: { section: true },
    });
    if (!tableSeat) throw new NotFoundException('TableSeat not found');
    return tableSeat;
  }

  async update(id: string, dto: UpdateTableSeatDto, business_id: string) {
    await this.findOne(id, business_id);
    await this.tableSeatRepository.update(id, dto);
    return this.findOne(id, business_id);
  }

  async remove(id: string, business_id: string) {
    await this.findOne(id, business_id);
    await this.tableSeatRepository.delete(id);
  }
}
