import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import { EmployeeStatus } from './entities/employee.entity';

const mockEmployee: Employee = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'John Doe',
  status: EmployeeStatus.WORKING,
  profilePictureUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    const config: Record<string, string> = {
      AWS_REGION: 'eu-central-1',
      AWS_ACCESS_KEY_ID: 'fake-key',
      AWS_SECRET_ACCESS_KEY: 'fake-secret',
      AWS_S3_BUCKET_NAME: 'fake-bucket',
    };
    return config[key];
  }),
};

const mockS3Send = jest.fn();

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: mockS3Send,
  })),
  PutObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
}));

describe('EmployeesService', () => {
  let service: EmployeesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: getRepositoryToken(Employee),
          useValue: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of employees', async () => {
      mockRepository.find.mockResolvedValue([mockEmployee]);

      const result = await service.findAll();

      expect(result).toEqual([mockEmployee]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });

    it('should return an empty array when no employees exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create and return a new employee without a file', async () => {
      const createDto = { name: 'John Doe', status: EmployeeStatus.WORKING };
      mockRepository.create.mockReturnValue(mockEmployee);
      mockRepository.save.mockResolvedValue(mockEmployee);

      const result = await service.create(createDto);

      expect(result).toEqual(mockEmployee);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockEmployee);
    });

    it('should create an employee and upload profile picture when file is provided', async () => {
      const createDto = { name: 'John Doe', status: EmployeeStatus.WORKING };
      const mockFile = {
        originalname: 'photo.jpg',
        buffer: Buffer.from('fake-image'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      mockS3Send.mockResolvedValue({});
      mockRepository.create.mockReturnValue({ ...mockEmployee });
      mockRepository.save.mockResolvedValue({
        ...mockEmployee,
        profilePictureUrl:
          'https://fake-bucket.s3.eu-central-1.amazonaws.com/profile-pictures/photo.jpg',
      });

      const result = await service.create(createDto, mockFile);

      expect(mockS3Send).toHaveBeenCalled();
      expect(result.profilePictureUrl).toBeTruthy();
    });
  });

  describe('update', () => {
    it('should update employee status', async () => {
      const updatedEmployee = {
        ...mockEmployee,
        status: EmployeeStatus.ON_VACATION,
      };
      mockRepository.findOne.mockResolvedValue(mockEmployee);
      mockRepository.save.mockResolvedValue(updatedEmployee);

      const result = await service.update(mockEmployee.id, {
        status: EmployeeStatus.ON_VACATION,
      });

      expect(result.status).toEqual(EmployeeStatus.ON_VACATION);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should update status and upload profile picture when file is provided', async () => {
      const mockFile = {
        originalname: 'photo.jpg',
        buffer: Buffer.from('fake-image'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      mockS3Send.mockResolvedValue({});
      mockRepository.findOne.mockResolvedValue(mockEmployee);
      mockRepository.save.mockResolvedValue({
        ...mockEmployee,
        status: EmployeeStatus.ON_VACATION,
        profilePictureUrl:
          'https://fake-bucket.s3.eu-central-1.amazonaws.com/profile-pictures/photo.jpg',
      });

      const result = await service.update(
        mockEmployee.id,
        { status: EmployeeStatus.ON_VACATION },
        mockFile,
      );

      expect(mockS3Send).toHaveBeenCalled();
      expect(result.profilePictureUrl).toBeTruthy();
      expect(result.status).toEqual(EmployeeStatus.ON_VACATION);
    });

    it('should throw NotFoundException when employee does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', {
          status: EmployeeStatus.ON_VACATION,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an employee successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockEmployee);
      mockRepository.remove.mockResolvedValue(mockEmployee);

      await service.remove(mockEmployee.id);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockEmployee);
    });

    it('should throw NotFoundException when employee does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete profile picture from S3 when employee has one', async () => {
      const employeeWithPicture = {
        ...mockEmployee,
        profilePictureUrl:
          'https://fake-bucket.s3.eu-central-1.amazonaws.com/profile-pictures/photo.jpg',
      };
      mockRepository.findOne.mockResolvedValue(employeeWithPicture);
      mockRepository.remove.mockResolvedValue(employeeWithPicture);
      mockS3Send.mockResolvedValue({});

      await service.remove(employeeWithPicture.id);

      expect(mockS3Send).toHaveBeenCalled();
    });
  });
});
