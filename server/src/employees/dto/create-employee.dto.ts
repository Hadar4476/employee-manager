import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmployeeStatus } from '../entities/employee.entity';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: EmployeeStatus, example: EmployeeStatus.WORKING })
  @IsEnum(EmployeeStatus)
  @IsNotEmpty()
  status: EmployeeStatus;
}
