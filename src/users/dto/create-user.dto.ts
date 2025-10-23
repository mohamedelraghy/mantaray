import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { RoleEnum } from '../enums/role.enum';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({ type: String, required: true, example: 'email@example.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, required: true, example: 'John' })
  name: string;

  @IsStrongPassword()
  @ApiProperty({ type: String, required: true, example: 'P@ssw0rd' })
  password: string;

  @IsEnum(RoleEnum)
  @ApiProperty({
    type: String,
    required: true,
    enum: RoleEnum,
    example: RoleEnum.USER,
  })
  role: string;
}
