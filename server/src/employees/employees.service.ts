import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeStatusDto } from './dto/update-employee-status.dto';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EmployeesService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly configService: ConfigService,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION')!,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        )!,
      },
    });

    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME')!;
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    createEmployeeDto: CreateEmployeeDto,
    file?: Express.Multer.File,
  ): Promise<Employee> {
    const employee = this.employeeRepository.create(createEmployeeDto);

    if (file) {
      const fileKey = `profile-pictures/${uuidv4()}-${file.originalname}`;
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      employee.profilePictureUrl = `https://${this.bucketName}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${fileKey}`;
    }

    return this.employeeRepository.save(employee);
  }

  async updateStatus(
    id: string,
    updateEmployeeStatusDto: UpdateEmployeeStatusDto,
  ): Promise<Employee> {
    const employee = await this.findOneOrFail(id);
    employee.status = updateEmployeeStatusDto.status;
    return this.employeeRepository.save(employee);
  }

  async updateProfilePicture(
    id: string,
    file: Express.Multer.File,
  ): Promise<Employee> {
    const employee = await this.findOneOrFail(id);

    if (employee.profilePictureUrl) {
      await this.deleteFromS3(employee.profilePictureUrl);
    }

    const fileKey = `profile-pictures/${uuidv4()}-${file.originalname}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const profilePictureUrl = `https://${this.bucketName}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${fileKey}`;
    employee.profilePictureUrl = profilePictureUrl;
    return this.employeeRepository.save(employee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOneOrFail(id);

    if (employee.profilePictureUrl) {
      await this.deleteFromS3(employee.profilePictureUrl);
    }

    await this.employeeRepository.remove(employee);
  }

  private async findOneOrFail(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }

    return employee;
  }

  private async deleteFromS3(profilePictureUrl: string): Promise<void> {
    const fileKey = profilePictureUrl.split('.amazonaws.com/')[1];
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      }),
    );
  }
}
