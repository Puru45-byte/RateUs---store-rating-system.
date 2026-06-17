import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from '../decorators/password.decorator';

export class RegisterStoreOwnerDto {
  // ─── Owner Details ───────────────────────────────────────
  @ApiProperty({ description: 'Owner name (20-60 chars)', example: 'Johnathan Alexander Smith' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(60)
  ownerName: string;

  @ApiProperty({ description: 'Owner email address', example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  ownerEmail: string;

  @ApiProperty({ description: 'Password (8-16 chars, uppercase + special)', example: 'P@ssword1' })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty({ description: 'Owner address (max 400 chars)', example: '200 Commercial Blvd, New York, NY' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(400)
  ownerAddress: string;

  // ─── Store Details ────────────────────────────────────────
  @ApiProperty({ description: 'Store name (20-60 chars)', example: 'Sunshine Grocery Market' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(60)
  storeName: string;

  @ApiProperty({ description: 'Store contact email', example: 'contact@sunshinegrocery.com' })
  @IsEmail()
  @IsNotEmpty()
  storeEmail: string;

  @ApiProperty({ description: 'Store address (max 400 chars)', example: '500 Shopping Plaza Ave, Chicago, IL' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(400)
  storeAddress: string;
}
