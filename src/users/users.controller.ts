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

import { RequestWithUser } from '../core/interfaces/user-request.interface';
import { SearchOptions } from '../core/shared/searchOptions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleEnum } from './enums/role.enum';
import { UsersService } from './users.service';
import { ApiOperation } from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')

export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get('/me')
  @ApiOperation({ summary: 'Get my profile - User and Super Admin' })
  @UseGuards(JwtAuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.USER)
  async profile(@Req() req: RequestWithUser) {
    return { user: req.user };
  }

  @Patch('/me')
  @ApiOperation({ summary: 'Update my profile - User and Super Admin' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.USER)
  updateMe(@Req() req: RequestWithUser, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.update(req.user._id, updateProfileDto);
  }

  @Post('search')
  @ApiOperation({ summary: 'Search for users - Super Admin Only' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  findAll(@Body() options: SearchOptions) {
    return this.usersService.findAll(options);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id - Super Admin Only' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by id - Super Admin Only' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by id - Super Admin Only' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
