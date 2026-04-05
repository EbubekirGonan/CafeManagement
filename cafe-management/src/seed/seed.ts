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
  entities: [__dirname + '/../entities/*.entity.{ts,js}'],
});

async function seed() {
  await dataSource.initialize();
  console.log('Veritabanına bağlanıldı.');

  const businessRepo = dataSource.getRepository('businesses');
  const userRepo = dataSource.getRepository('users');
  const categoryRepo = dataSource.getRepository('categories');
  const sectionRepo = dataSource.getRepository('sections');
  const tableSeatRepo = dataSource.getRepository('table_seats');
  const productRepo = dataSource.getRepository('products');

  // --- İşletme ---
  let business = await businessRepo.findOne({ where: { name: 'Demo Kafe' } });
  if (!business) {
    business = await businessRepo.save({ name: 'Demo Kafe' });
    console.log('İşletme oluşturuldu: Demo Kafe');
  } else {
    console.log('İşletme zaten mevcut: Demo Kafe');
  }
  const businessId = (business as any).id;

  // --- Admin Kullanıcı ---
  const existingUser = await userRepo.findOne({ where: { email: 'admin@kafe.com' } });
  if (!existingUser) {
    const passwordHash = await bcrypt.hash('123456', 10);
    await userRepo.save({
      name: 'Admin',
      email: 'admin@kafe.com',
      password_hash: passwordHash,
      role: 'admin',
      business_id: businessId,
    });
    console.log('Kullanıcı oluşturuldu: admin@kafe.com');
  } else {
    console.log('Kullanıcı zaten mevcut: admin@kafe.com');
  }

  // --- Ürün Kategorileri ---
  const categoryNames = ['Sıcak İçecekler', 'Soğuk İçecekler', 'Tatlılar', 'Atıştırmalıklar', 'Kahvaltı'];
  const categoryMap: Record<string, string> = {};

  for (const name of categoryNames) {
    let cat = await categoryRepo.findOne({ where: { name, business_id: businessId } });
    if (!cat) {
      cat = await categoryRepo.save({ name, business_id: businessId });
      console.log(`Kategori oluşturuldu: ${name}`);
    } else {
      console.log(`Kategori zaten mevcut: ${name}`);
    }
    categoryMap[name] = (cat as any).id;
  }

  // --- İşletme Bölümleri ---
  const sectionNames = ['Giriş Katı', 'Bahçe', 'Teras', 'VIP Salon'];
  const sectionMap: Record<string, string> = {};

  for (const name of sectionNames) {
    let sec = await sectionRepo.findOne({ where: { name, business_id: businessId } });
    if (!sec) {
      sec = await sectionRepo.save({ name, business_id: businessId });
      console.log(`Bölüm oluşturuldu: ${name}`);
    } else {
      console.log(`Bölüm zaten mevcut: ${name}`);
    }
    sectionMap[name] = (sec as any).id;
  }

  // --- Masalar (her bölüme 5 masa) ---
  for (const sectionName of sectionNames) {
    const sectionId = sectionMap[sectionName];
    for (let i = 1; i <= 5; i++) {
      const tableName = `Masa ${i}`;
      const existing = await tableSeatRepo.findOne({
        where: { name: tableName, section_id: sectionId },
      });
      if (!existing) {
        await tableSeatRepo.save({
          name: tableName,
          status: 'available',
          section_id: sectionId,
        });
        console.log(`Masa oluşturuldu: ${sectionName} > ${tableName}`);
      } else {
        console.log(`Masa zaten mevcut: ${sectionName} > ${tableName}`);
      }
    }
  }

  // --- Ürünler ---
  const products = [
    { name: 'Türk Kahvesi', category: 'Sıcak İçecekler', price: 45 },
    { name: 'Filtre Kahve', category: 'Sıcak İçecekler', price: 55 },
    { name: 'Latte', category: 'Sıcak İçecekler', price: 70 },
    { name: 'Americano', category: 'Sıcak İçecekler', price: 60 },
    { name: 'Çay', category: 'Sıcak İçecekler', price: 25 },
    { name: 'Limonata', category: 'Soğuk İçecekler', price: 65 },
    { name: 'Ice Latte', category: 'Soğuk İçecekler', price: 75 },
    { name: 'Soğuk Çay', category: 'Soğuk İçecekler', price: 45 },
    { name: 'Cheesecake', category: 'Tatlılar', price: 120 },
    { name: 'Brownie', category: 'Tatlılar', price: 95 },
    { name: 'Kruvasan', category: 'Atıştırmalıklar', price: 55 },
    { name: 'Tost', category: 'Atıştırmalıklar', price: 85 },
    { name: 'Serpme Kahvaltı', category: 'Kahvaltı', price: 220 },
  ];

  for (const p of products) {
    const existing = await productRepo.findOne({
      where: { name: p.name, business_id: businessId },
    });
    if (!existing) {
      await productRepo.save({
        name: p.name,
        price: p.price,
        category_id: categoryMap[p.category],
        business_id: businessId,
      });
      console.log(`Ürün oluşturuldu: ${p.name} — ${p.price}₺`);
    } else {
      console.log(`Ürün zaten mevcut: ${p.name}`);
    }
  }

  // --- Superadmin ---
  let systemBusiness = await businessRepo.findOne({ where: { name: 'System' } });
  if (!systemBusiness) {
    systemBusiness = await businessRepo.save({ name: 'System' });
    console.log('İşletme oluşturuldu: System');
  } else {
    console.log('İşletme zaten mevcut: System');
  }

  const existingSuperAdmin = await userRepo.findOne({ where: { email: 'superadmin@kafe.com' } });
  if (!existingSuperAdmin) {
    const passwordHash = await bcrypt.hash('123456', 10);
    await userRepo.save({
      name: 'Super Admin',
      email: 'superadmin@kafe.com',
      password_hash: passwordHash,
      role: 'superadmin',
      business_id: (systemBusiness as any).id,
    });
    console.log('Kullanıcı oluşturuldu: superadmin@kafe.com');
  } else {
    console.log('Kullanıcı zaten mevcut: superadmin@kafe.com');
  }

  await dataSource.destroy();
  console.log('\nSeed tamamlandı.');
}

seed().catch((err) => {
  console.error('Seed hatası:', err);
  process.exit(1);
});
