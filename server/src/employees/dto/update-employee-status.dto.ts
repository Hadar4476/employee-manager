import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmployeeStatus } from '../entities/employee.entity';

export class UpdateEmployeeStatusDto {
  @ApiProperty({ enum: EmployeeStatus, example: EmployeeStatus.WORKING })
  @IsEnum(EmployeeStatus)
  @IsNotEmpty()
  status: EmployeeStatus;
}
