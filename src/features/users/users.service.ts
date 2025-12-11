import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { InvalidCredentialsException } from '@core/exceptions/invalid-credentials.exceptions';

import { BaseService } from '@core/shared/base.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User, UserDoc } from './entities/user.entity';

@Injectable()
export class UsersService extends BaseService<UserDoc> {
  constructor(
    @InjectModel(User.name)
    private readonly m: Model<UserDoc>
  ) {
    super(m);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async updatePasswordMe(id: string, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.findOneById(id);
    const isPasswordValid = await bcrypt.compare(
      updatePasswordDto.oldPassword,
      user.password
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }
    if (updatePasswordDto.password !== updatePasswordDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    user.password = updatePasswordDto.password;
    await this.update(id, { password: updatePasswordDto.password });

    return {
      message: 'Password updated successfully'
    };
  }
}
