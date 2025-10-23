import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Booking, bookingSchema } from './entities/booking.entity';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { UsersModule } from '../users/users.module';
import { ClassesModule } from '../classes/classes.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: bookingSchema }]),
    UsersModule,
    ClassesModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
