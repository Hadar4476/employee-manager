import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

describe('Employees (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let createdEmployeeId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
    dataSource = moduleFixture.get(DataSource);
  });

  afterAll(async () => {
    await dataSource.query(
      `DELETE FROM employees WHERE name = 'E2E Test Employee'`,
    );
    await app.close();
  });

  describe('POST /employees', () => {
    it('should create a new employee and return 201', async () => {
      const response = await request(app.getHttpServer())
        .post('/employees')
        .field('name', 'E2E Test Employee')
        .field('status', 'Working')
        .expect(201);

      const body = response.body as {
        name: string;
        status: string;
        id: string;
      };

      expect(body.name).toEqual('E2E Test Employee');
      expect(body.status).toEqual('Working');
      expect(body.id).toBeDefined();

      createdEmployeeId = body.id;
    });

    it('should return 400 when name is missing', async () => {
      await request(app.getHttpServer())
        .post('/employees')
        .field('status', 'Working')
        .expect(400);
    });

    it('should return 400 when status is invalid', async () => {
      await request(app.getHttpServer())
        .post('/employees')
        .field('name', 'E2E Test Employee')
        .field('status', 'InvalidStatus')
        .expect(400);
    });
  });

  describe('GET /employees', () => {
    it('should return an array of employees', async () => {
      const response = await request(app.getHttpServer())
        .get('/employees')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PATCH /employees/:id', () => {
    it('should update employee status and return 200', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/employees/${createdEmployeeId}`)
        .field('status', 'OnVacation')
        .expect(200);

      const body = response.body as {
        status: string;
      };

      expect(body.status).toEqual('OnVacation');
    });

    it('should return 400 when status is invalid', async () => {
      await request(app.getHttpServer())
        .patch(`/employees/${createdEmployeeId}`)
        .field('status', 'InvalidStatus')
        .expect(400);
    });

    it('should return 404 when employee does not exist', async () => {
      await request(app.getHttpServer())
        .patch('/employees/123e4567-e89b-12d3-a456-426614174000')
        .field('status', 'Working')
        .expect(404);
    });
  });

  describe('DELETE /employees/:id', () => {
    it('should delete employee and return 204', async () => {
      await request(app.getHttpServer())
        .delete(`/employees/${createdEmployeeId}`)
        .expect(204);
    });

    it('should return 404 when employee does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/employees/123e4567-e89b-12d3-a456-426614174000')
        .expect(404);
    });
  });
});
