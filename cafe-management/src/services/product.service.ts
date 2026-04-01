import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/product/create-product.dto';
import { UpdateProductDto } from '../dto/product/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  create(dto: CreateProductDto, business_id: string) {
    const product = this.productRepository.create({ ...dto, business_id });
    return this.productRepository.save(product);
  }

  findAll(business_id: string) {
    return this.productRepository.find({ where: { business_id } });
  }

  async findOne(id: string, business_id: string) {
    const product = await this.productRepository.findOneBy({ id, business_id });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductDto, business_id: string) {
    await this.findOne(id, business_id);
    await this.productRepository.update(id, dto);
    return this.findOne(id, business_id);
  }

  async remove(id: string, business_id: string) {
    await this.findOne(id, business_id);
    await this.productRepository.delete(id);
  }
}
