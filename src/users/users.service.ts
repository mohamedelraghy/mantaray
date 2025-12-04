import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { Pagination } from '../core/shared/pagination.dto';
import { SearchOptions } from '../core/shared/searchOptions.dto';
import { BaseService } from '../core/shared/base.service';
import { User, UserDoc } from './entities/user.entity';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { InvalidCredentialsException } from 'src/core/exceptions/invalid-credentials.exceptions';

@Injectable()
export class UsersService extends BaseService<UserDoc> {
  constructor(
    @InjectModel(User.name)
    private readonly m: Model<UserDoc>,
  ) {
    super(m);
  }

  async findAll(options: SearchOptions): Promise<Pagination> {
    const aggregation: any = [];
    const {
      offset,
      size,
      sort,
      dir,
      filterBy,
      searchTerm,
      attributesToRetrieve,
      filterByDateFrom,
      filterByDateTo,
    } = options;

    if (sort && dir) this.sort(aggregation, sort, dir);

    if (filterBy?.length) this.filter(aggregation, filterBy);

    if (searchTerm) this.search(aggregation, searchTerm);

    if (attributesToRetrieve?.length)
      this.project(aggregation, attributesToRetrieve);

    if (filterByDateFrom && filterByDateTo) {
      aggregation.push(
        {
          $addFields: {
            createdAtToString: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
          },
        },
        {
          $match: {
            createdAtToString: { $gte: filterByDateFrom, $lte: filterByDateTo },
          },
        },
        {
          $project: {
            createdAtToString: 0,
          },
        },
      );
    }

    return this.aggregate(aggregation, offset, size);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  private search(aggregation: any, searchTerm: string) {
    aggregation.push({
      $match: {
        $or: [
          { email: { $regex: new RegExp(searchTerm), $options: 'i' } },
          { name: { $regex: new RegExp(searchTerm), $options: 'i' } },
        ],
      },
    });
  }

  async updatePasswordMe(id: string, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.findOneById(id);
    const isPasswordValid = await bcrypt.compare(updatePasswordDto.oldPassword, user.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }
    if (updatePasswordDto.password !== updatePasswordDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    user.password = updatePasswordDto.password;
    await this.update(id, { password: updatePasswordDto.password });

    return {
      message: 'Password updated successfully',
    };
  }
}
