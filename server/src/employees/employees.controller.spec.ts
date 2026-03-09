import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { EmployeeStatus } from './entities/employee.entity';

const mockEmployee = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'John Doe',
  status: EmployeeStatus.WORKING,
  profilePictureUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockEmployeesService = {
  findAll: jest.fn(),
  create: jest.fn(),
  updateStatus: jest.fn(),
  updateProfilePicture: jest.fn(),
  remove: jest.fn(),
};

describe('EmployeesController', () => {
  let controller: EmployeesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
      ],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of employees', async () => {
      mockEmployeesService.findAll.mockResolvedValue([mockEmployee]);

      const result = await controller.findAll();

      expect(result).toEqual([mockEmployee]);
      expect(mockEmployeesService.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new employee', async () => {
      const createDto = { name: 'John Doe', status: EmployeeStatus.WORKING };
      mockEmployeesService.create.mockResolvedValue(mockEmployee);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockEmployee);
      expect(mockEmployeesService.create).toHaveBeenCalledWith(
        createDto,
        undefined,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update employee status', async () => {
      const updatedEmployee = {
        ...mockEmployee,
        status: EmployeeStatus.ON_VACATION,
      };
      mockEmployeesService.updateStatus.mockResolvedValue(updatedEmployee);

      const result = await controller.updateStatus(mockEmployee.id, {
        status: EmployeeStatus.ON_VACATION,
      });

      expect(result.status).toEqual(EmployeeStatus.ON_VACATION);
      expect(mockEmployeesService.updateStatus).toHaveBeenCalledWith(
        mockEmployee.id,
        { status: EmployeeStatus.ON_VACATION },
      );
    });
  });

  describe('remove', () => {
    it('should delete an employee', async () => {
      mockEmployeesService.remove.mockResolvedValue(undefined);

      await controller.remove(mockEmployee.id);

      expect(mockEmployeesService.remove).toHaveBeenCalledWith(mockEmployee.id);
    });
  });
});
