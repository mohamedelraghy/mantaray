import {
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { InvalidCredentialsException, RecordNotFoundException } from '../core/exceptions';
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
  }

  generateJwtToken(user: UserDoc): any {
    const payload = { email: user.email, sub: user._id };
    return { access_token: this.jwtService.sign(payload) };
  }

  async login(user: UserDoc): Promise<{ token: string; user: any }> {
    const token = this.generateJwtToken(user).access_token;
    
    const userDoc = user.toObject?.() || user;
    const { password, ...userWithoutPassword } = userDoc;

    return {
      token,
      user: userWithoutPassword,
    };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne({ email });

    if (user) {
      const isPasswordValid = await bcrypt.compare(pass, user.password);
      if (!isPasswordValid) throw new InvalidCredentialsException();
    } else {
      throw new RecordNotFoundException('user', 'email', email);
    }

    const userDoc = user.toJSON();
    delete userDoc.password;

    return userDoc;
  }
}
