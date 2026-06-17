import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from '../decorators/password.decorator';

export class RegisterDto {
  @ApiProperty({
    description: 'Name of the user, must be between 5 and 60 characters',
    minLength: 5,
    maxLength: 60,
    example: 'Johnathan Alexander Smith',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(60)
  name: string;

  @ApiProperty({
    description: 'Valid email address',
    example: 'john.smith@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password, must be 8-16 chars with at least 1 uppercase and 1 special character',
    minLength: 8,
    maxLength: 16,
    example: 'P@ssword123!',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    description: 'Address of the user, maximum 400 characters',
    maxLength: 400,
    example: '123 Main St, Apt 4B, San Francisco, CA 94107',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(400)
  address: string;
}
