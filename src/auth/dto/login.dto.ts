import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @ApiProperty({ example: 'email@example.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'P@ssw0rd' })
  password: string;
}
