import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStoreDto {
  @ApiProperty({
    description: 'Name of the store, must be between 5 and 60 characters',
    minLength: 5,
    maxLength: 60,
    example: 'SuperMart Grocery Store Outlet',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(60)
  name: string;

  @ApiProperty({
    description: 'Store contact email address',
    example: 'contact@supermartgrocery.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Physical address of the store, maximum 400 characters',
    maxLength: 400,
    example: '500 Shopping Plaza Ave, Suite 10, Chicago, IL 60611',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(400)
  address: string;

  @ApiProperty({
    description: 'ID of the User who owns the store (must have Role.STORE_OWNER)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  ownerId?: string;
}
