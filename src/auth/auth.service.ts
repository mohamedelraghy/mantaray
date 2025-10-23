import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { InvalidCredentialsException } from '../core/exceptions';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { UserDoc } from '../users/entities/user.entity';
import { RoleEnum } from '../users/enums/role.enum';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    try {
      const user = await this.usersService.create({
        ...signupDto,
        role: RoleEnum.USER,
      });
      const payload = { sub: user?._id, email: user?.email };

      const { password, ...userWithoutPassword } = user.toObject?.() || user;

      return {
        ...userWithoutPassword,
        access_token: this.jwtService.sign(payload),
      };
    } catch (e) {
      throw new BadRequestException(e.toString());
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user._id, email: user.email };

    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }

  generateJwtToken(user: UserDoc): any {
    const payload = { email: user.email, sub: user._id };
    return { access_token: this.jwtService.sign(payload) };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne({ email });

    if (user) {
      const isPasswordValid = await bcrypt.compare(pass, user.password);
      if (!isPasswordValid) throw new InvalidCredentialsException();
    } else {
      throw new NotFoundException({ message: 'User not found' });
    }

    const userDoc = user.toJSON();
    delete userDoc.password;

    return userDoc;
  }
}
