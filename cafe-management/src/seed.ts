import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'cafe_management',
  synchronize: true,
  entities: [__dirname + '/entities/*.entity.{ts,js}'],
});

async function seed() {
  await dataSource.initialize();
  console.log('Veritabanına bağlanıldı.');

  const businessRepo = dataSource.getRepository('businesses');
  const userRepo = dataSource.getRepository('users');

  // Check if sample business already exists
  let business = await businessRepo.findOne({ where: { name: 'Demo Kafe' } });
  if (!business) {
    business = await businessRepo.save({ name: 'Demo Kafe' });
    console.log('İşletme oluşturuldu:', business.name);
  } else {
    console.log('İşletme zaten mevcut:', business.name);
  }

  // Check if sample user already exists
  const existingUser = await userRepo.findOne({ where: { email: 'admin@kafe.com' } });
  if (!existingUser) {
    const passwordHash = await bcrypt.hash('123456', 10);
    const user = await userRepo.save({
      name: 'Admin',
      email: 'admin@kafe.com',
      password_hash: passwordHash,
      role: 'admin',
      business_id: business.id,
    });
    console.log('Kullanıcı oluşturuldu:', user.email);
  } else {
    console.log('Kullanıcı zaten mevcut:', existingUser.email);
  }

  await dataSource.destroy();
  console.log('Seed tamamlandı.');
}

seed().catch((err) => {
  console.error('Seed hatası:', err);
  process.exit(1);
});
