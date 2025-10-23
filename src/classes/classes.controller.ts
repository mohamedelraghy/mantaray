import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { SearchOptions } from '../core/shared/searchOptions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/roles.decorator';
import { RoleEnum } from '../users/enums/role.enum';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassesService } from './classes.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('classes')
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new class - Super Admin Only' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create({...createClassDto, remainingCapacity: createClassDto.capacity});
  }

  @Post('search')
  @ApiOperation({ summary: 'Search for classes - Super Admin and User' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.USER)
  findAll(@Body() options: SearchOptions) {
    return this.classesService.findAll(options);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a class by id - Super Admin and User' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.USER)
  findOne(@Param('id') id: string) {
    return this.classesService.findOneById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a class by id - Super Admin Only' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classesService.update(id, updateClassDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a class by id - Super Admin Only' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.classesService.remove(id);
  }
}
