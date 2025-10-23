import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Pagination } from '../core/shared/pagination.dto';
import { SearchOptions } from '../core/shared/searchOptions.dto';
import { BaseService } from '../core/shared/base.service';
import { Membership, MembershipDoc } from './entities/membership.entity';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UsersService } from 'src/users/users.service';
import { Populate } from 'src/core/interfaces/mongo-population.interface';
import { RequestWithUser } from 'src/core/interfaces/user-request.interface';
import { RoleEnum } from 'src/users/enums/role.enum';

@Injectable()
export class MembershipsService extends BaseService<MembershipDoc> {
  constructor(
    @InjectModel(Membership.name)
    private readonly membershipModel: Model<MembershipDoc>,
    private readonly usersService: UsersService,
  ) {
    super(membershipModel);
  }

  async createMembership(createMembershipDto: CreateMembershipDto): Promise<MembershipDoc> {
    const { userId, creditsToAdded } = createMembershipDto;

    // Validate that the user exists
    await this.usersService.findOneById(userId);

    // Create the membership record
    const membership = await this.create({
      userId,
      creditsToAdded,
    });

    // Update user's credits
    await this.usersService.update(userId, {
      $inc: { credits: creditsToAdded },
    });

    return membership;
  }

  async findAll(options: SearchOptions, req: RequestWithUser): Promise<Pagination> {
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

    
    if (req.user.role !== RoleEnum.SUPER_ADMIN) {
      aggregation.push({
        $match: {
          userId: req.user._id,
        },
      });
    }
    
    this.populateUserPipeline(aggregation);
    
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

  async removeMembership(id: string): Promise<boolean> {
    const membership = await this.findOneById(id);
    
    // Remove the credits that were added when this membership was created
    await this.usersService.update(membership.userId, {
      $inc: { credits: -membership.creditsToAdded },
    });
    
    // Delete the membership record
    return this.remove(id);
  }

  private search(aggregation: any, searchTerm: string) {
    aggregation.push({
      $match: {
        $or: [
          { userEmail: { $regex: new RegExp(searchTerm), $options: 'i' } },
          { userName: { $regex: new RegExp(searchTerm), $options: 'i' } },
          { creditsToAdded: { $eq: parseInt(searchTerm) || 0 } },
        ],
      },
    });
  }

  private populateUserPipeline = (aggregation: any) => {
    let populateParams: Populate = {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'user',
      pipeline: [{ $project: { name: 1, email: 1 } }],
    };

    this.populatePipeline(aggregation, populateParams);
    this.unwind(aggregation, populateParams.as, true);

    aggregation.push({ $project: { userId: 0 } });
  };
}
