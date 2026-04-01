import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BusinessModule } from './modules/business.module';
import { UserModule } from './modules/user.module';
import { SectionModule } from './modules/section.module';
import { TableSeatModule } from './modules/table-seat.module';
import { SessionModule } from './modules/session.module';
import { CategoryModule } from './modules/category.module';
import { ProductModule } from './modules/product.module';
import { OrderItemModule } from './modules/order-item.module';
import { ExpenseModule } from './modules/expense.module';
import { AuthModule } from './modules/auth.module';
import { DashboardModule } from './modules/dashboard.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    BusinessModule,
    UserModule,
    SectionModule,
    TableSeatModule,
    SessionModule,
    CategoryModule,
    ProductModule,
    OrderItemModule,
    ExpenseModule,
    AuthModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
