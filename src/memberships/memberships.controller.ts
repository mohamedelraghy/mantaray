import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { SearchOptions } from '../core/shared/searchOptions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/roles.decorator';
import { RoleEnum } from '../users/enums/role.enum';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { MembershipsService } from './memberships.service';
import { RequestWithUser } from 'src/core/interfaces/user-request.interface';

@Controller('memberships')
export class MembershipsController {
  constructor(
    private readonly membershipsService: MembershipsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new membership and assign credits to user - Super Admin Only' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  create(@Body() createMembershipDto: CreateMembershipDto) {
    return this.membershipsService.createMembership(createMembershipDto);
  }

  @Post('search')
  @ApiOperation({ summary: 'Search for memberships - Super Admin to see all membership in system and User to see their own memberships' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.USER)
  findAll(@Body() options: SearchOptions, @Req() req: RequestWithUser) {
    return this.membershipsService.findAll(options, req);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a membership by id and remove credits from user - Super Admin Only' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.membershipsService.removeMembership(id);
  }
}
