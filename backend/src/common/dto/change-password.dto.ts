import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from '../decorators/password.decorator';

export class ChangePasswordDto {
  @ApiProperty({
    description: "The user's current password",
    example: 'Password123!',
  })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    description: 'The new password, must meet the strong password requirements',
    minLength: 8,
    maxLength: 16,
    example: 'NewP@ssword987!',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  newPassword: string;
}
