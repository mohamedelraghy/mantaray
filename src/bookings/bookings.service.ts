import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { BaseService } from '../core/shared/base.service';
import { Pagination } from '../core/shared/pagination.dto';
import { SearchOptions } from '../core/shared/searchOptions.dto';
import { Booking, BookingDoc } from './entities/booking.entity';
import { UsersService } from '../users/users.service';
import { ClassesService } from '../classes/classes.service';
import { Populate } from '../core/interfaces/mongo-population.interface';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RequestWithUser } from 'src/core/interfaces/user-request.interface';
import { ClassDoc } from 'src/classes/entities/class.entity';
import { RoleEnum } from 'src/users/enums/role.enum';
import { BookingStatus } from './enums/booking-status.enum';

@Injectable()
export class BookingsService extends BaseService<BookingDoc> {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDoc>,
    private readonly usersService: UsersService,
    private readonly classesService: ClassesService,
  ) {
    super(bookingModel);
  }

  async createBooking(createDto: CreateBookingDto, req: RequestWithUser): Promise<BookingDoc> {
    // Check if class exists
    const klass = await this.classesService.findOneById(createDto.classId);

    // Capacity check
    if (klass.remainingCapacity <= 0) {
      throw new BadRequestException('Class is full');
    }

    // check if already booked
    const alreadyBooked = await this.findOne({ classId: createDto.classId, userId: req.user._id, status: { $ne: BookingStatus.REFUNDED } });
    if (alreadyBooked) {
      throw new BadRequestException('You have already booked this class');
    }

    // Overlap check - check if user has any bookings that overlap with this class time
    const overlappingBookings = await this.find({
      userId: req.user._id,
      startTime: { $lt: klass.endTime },
      endTime: { $gt: klass.startTime },
      status: { $ne: BookingStatus.REFUNDED }
    });
    
    if (overlappingBookings.length > 0) {
      throw new BadRequestException('Overlapping class booking not allowed');
    }

    // Credits check
    if (req.user.credits < klass.creditCost) {
      throw new BadRequestException('Not enough credits');
    }

    // Create booking with class times
    const booking = await this.create({ 
      classId: createDto.classId, 
      userId: req.user._id, 
      startTime: klass.startTime, 
      endTime: klass.endTime 
    });

    // Deduct credits atomically
    await this.usersService.update(req.user._id, { $inc: { credits: -(klass.creditCost) } });

    // Decrease remaining capacity
    await this.classesService.update(createDto.classId, { $inc: { remainingCapacity: -1 } });

    return booking;
  }

  async cancel(id: string): Promise<boolean> {
    const booking = await this.findOneById(id);
    if (!booking) throw new NotFoundException('Booking not found');

    // Load class to determine refund policy
    const klass = await this.classesService.findOneById(booking.classId);
    if (!klass) throw new NotFoundException('Class not found');

    const startTime = new Date(booking.startTime);
    const now = new Date();
    const twoHoursMs = 2 * 60 * 60 * 1000;

    // Refund if more than 2 hours before start
    if (startTime.getTime() - now.getTime() > twoHoursMs) {
      await this.usersService.update(booking.userId, {
        $inc: { credits: klass.creditCost },
      });
    }

    // Increase remaining capacity
    await this.classesService.update(booking.classId, { $inc: { remainingCapacity: 1 } });

    // Update booking status to REFUNDED
    await this.update(id, { status: BookingStatus.REFUNDED });

    return true;
  }

  async findOneBooking(id: string): Promise<BookingDoc> {
    const aggregation: any = [];
    
    // Match the specific booking by ID
    aggregation.push({
      $match: { _id: new Types.ObjectId(id) }
    });

    // Populate user and class data
    this.populateUserPipeline(aggregation);
    this.populateClassPipeline(aggregation);

    // Execute aggregation and return the first (and only) result
    const result = await this.bookingModel.aggregate(aggregation);
    
    if (!result || result.length === 0) {
      throw new NotFoundException('Booking not found');
    }

    return result[0] as BookingDoc;
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

    if (req.user.role === RoleEnum.USER) {
      aggregation.push({
        $match: {
          userId: req.user._id,
        },
      });
    }

    this.populateUserPipeline(aggregation);
    this.populateClassPipeline(aggregation);

    if (sort && dir) this.sort(aggregation, sort, dir);
    if (filterBy?.length) this.filter(aggregation, filterBy);
    if (searchTerm) this.search(aggregation, searchTerm);
    if (attributesToRetrieve?.length) this.project(aggregation, attributesToRetrieve);

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
        { $project: { createdAtToString: 0 } },
      );
    }

    return this.aggregate(aggregation, offset, size);
  }

  private search(aggregation: any, searchTerm: string) {
    aggregation.push({
      $match: {
        $or: [
          { 'class.title': { $regex: new RegExp(searchTerm), $options: 'i' } },
          { 'user.email': { $regex: new RegExp(searchTerm), $options: 'i' } },
          { 'user.name': { $regex: new RegExp(searchTerm), $options: 'i' } },
          { 'class.title': { $regex: new RegExp(searchTerm), $options: 'i' } },
          { 'class.startTime': { $regex: new RegExp(searchTerm), $options: 'i' } },
          { 'class.endTime': { $regex: new RegExp(searchTerm), $options: 'i' } },
        ],
      },
    });
  }

  private populateUserPipeline(aggregation: any) {
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
  }

  private populateClassPipeline(aggregation: any) {
    let populateParams: Populate = {
        from: 'classes',
        localField: 'classId',
        foreignField: '_id',
        as: 'class',
        pipeline: [{ $project: { _id: 1, title: 1, capacity: 1, creditCost: 1, remainingCapacity: 1 } }],
      };
    this.populatePipeline(aggregation, populateParams);
    this.unwind(aggregation, populateParams.as, true);

    aggregation.push({ $project: { classId: 0 } });
  }
}
