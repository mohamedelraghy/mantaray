import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/roles.decorator';
import { RoleEnum } from '../users/enums/role.enum';
import { SearchOptions } from '../core/shared/searchOptions.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingsService } from './bookings.service';
import { RequestWithUser } from 'src/core/interfaces/user-request.interface';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a booking - deduct credits, capacity and overlap checks' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.USER)
  create(@Body() dto: CreateBookingDto, @Req() req: RequestWithUser) {
    return this.bookingsService.createBooking(dto, req);
  }

  @Post('search')
  @ApiOperation({ summary: 'Search bookings - Super Admin to see all bookings in system and User to see their own bookings' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.USER)
  findAll(@Body() options: SearchOptions, @Req() req: RequestWithUser) {
    return this.bookingsService.findAll(options, req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by id - Super Admin and User' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.USER)
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOneBooking(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel booking - refund if more than 2 hours before start' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.USER)
  cancel(@Param('id') id: string) {
    return this.bookingsService.cancel(id);
  }
}
