import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Membership, membershipSchema } from './entities/membership.entity';
import { User, userSchema } from '../users/entities/user.entity';
import { MembershipsController } from './memberships.controller';
import { MembershipsService } from './memberships.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Membership.name, schema: membershipSchema },
    ]),
    UsersModule,
  ],
  controllers: [MembershipsController],
  providers: [MembershipsService],
  exports: [MembershipsService],
})
export class MembershipsModule {}
