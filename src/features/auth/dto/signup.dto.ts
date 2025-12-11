import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword
} from 'class-validator';


export class SignupDto {
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
}
