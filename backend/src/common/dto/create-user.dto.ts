import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { RegisterDto } from './register.dto';

export class CreateUserDto extends RegisterDto {
  @ApiProperty({
    description: 'System role assigned to the user',
    enum: Role,
    example: Role.USER,
    default: Role.USER,
  })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
