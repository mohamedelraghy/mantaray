import {
  Injectable
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';


import { InvalidCredentialsException, RecordNotFoundException } from '@core/exceptions';
import { UserDoc } from '@features/users/entities/user.entity';
import { RoleEnum } from '@features/users/enums/role.enum';
import { UsersService } from '@features/users/users.service';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async signup(signupDto: SignupDto) {
    const user = await this.usersService.create({
      ...signupDto,
      role: RoleEnum.USER
    });
    const payload = { sub: user?._id, email: user?.email };

    delete user.toObject().password;

    return {
      ...user, 
      access_token: this.jwtService.sign(payload)
    };
  }

  generateJwtToken(user: UserDoc) {
    const payload = { email: user.email, sub: user._id };
    return { access_token: this.jwtService.sign(payload) };
  }

  login(user: UserDoc){
    const token = this.generateJwtToken(user).access_token;
    
    const userDoc = user.toObject?.() || user;
    delete userDoc.password;

    return {
      message: 'Login successful',
      data: {
        token,
        user: userDoc
      }
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
