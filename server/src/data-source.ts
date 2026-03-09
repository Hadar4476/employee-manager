import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Employee } from './employees/entities/employee.entity';

config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Employee],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  ssl: { rejectUnauthorized: false },
});
