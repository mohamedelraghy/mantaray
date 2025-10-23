import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';

import { BookingsService } from './bookings.service';
import { Booking, BookingDoc } from './entities/booking.entity';
import { UsersService } from '../users/users.service';
import { ClassesService } from '../classes/classes.service';
import { RoleEnum } from '../users/enums/role.enum';

describe('BookingsService', () => {
  let service: BookingsService;
  let bookingModel: Model<BookingDoc>;
  let usersService: UsersService;
  let classesService: ClassesService;

  const mockBooking = {
    _id: new Types.ObjectId(),
    classId: new Types.ObjectId(),
    userId: new Types.ObjectId(),
    startTime: new Date('2024-01-15T10:00:00.000Z'),
    endTime: new Date('2024-01-15T12:00:00.000Z'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockClass = {
    _id: new Types.ObjectId(),
    title: 'Test Class',
    capacity: 30,
    remainingCapacity: 30,
    creditCost: 5,
    startTime: new Date('2024-01-15T10:00:00.000Z'),
    endTime: new Date('2024-01-15T12:00:00.000Z'),
  };

  const mockUser = {
    _id: new Types.ObjectId(),
    email: 'test@example.com',
    name: 'Test User',
    credits: 10,
    role: RoleEnum.USER,
  };

  const mockRequest = {
    user: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getModelToken(Booking.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findByIdAndDelete: jest.fn(),
            aggregate: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOneById: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: ClassesService,
          useValue: {
            findOneById: jest.fn(),
            update: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    bookingModel = module.get<Model<BookingDoc>>(getModelToken(Booking.name));
    usersService = module.get<UsersService>(UsersService);
    classesService = module.get<ClassesService>(ClassesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBooking', () => {
    const createDto = {
      classId: mockClass._id.toString(),
      userId: mockUser._id.toString(),
    };

    beforeEach(() => {
      jest.spyOn(classesService, 'findOneById').mockResolvedValue(mockClass as any);
      jest.spyOn(bookingModel, 'findOne').mockResolvedValue(null);
      jest.spyOn(bookingModel, 'find').mockResolvedValue([]);
      jest.spyOn(bookingModel, 'create').mockResolvedValue(mockBooking as any);
      jest.spyOn(usersService, 'update').mockResolvedValue(mockUser as any);
      jest.spyOn(classesService, 'update').mockResolvedValue(mockClass as any);
    });

    it('should create a booking successfully', async () => {
      const result = await service.createBooking(createDto, mockRequest as any);

      expect(classesService.findOneById).toHaveBeenCalledWith(createDto.classId);
      expect(bookingModel.findOne).toHaveBeenCalledWith({
        classId: createDto.classId,
        userId: mockUser._id,
      });
      expect(bookingModel.create).toHaveBeenCalledWith({
        classId: createDto.classId,
        userId: mockUser._id,
        startTime: mockClass.startTime,
        endTime: mockClass.endTime,
      });
      expect(usersService.update).toHaveBeenCalledWith(mockUser._id, {
        $inc: { credits: -mockClass.creditCost },
      });
      expect(classesService.update).toHaveBeenCalledWith(createDto.classId, {
        $inc: { remainingCapacity: -1 },
      });
      expect(result).toEqual(mockBooking);
    });

    it('should throw BadRequestException when class is full', async () => {
      const fullClass = { ...mockClass, remainingCapacity: 0 };
      jest.spyOn(classesService, 'findOneById').mockResolvedValue(fullClass as any);

      await expect(service.createBooking(createDto, mockRequest as any))
        .rejects.toThrow(BadRequestException);
      await expect(service.createBooking(createDto, mockRequest as any))
        .rejects.toThrow('Class is full');
    });

    it('should throw BadRequestException when user already booked the class', async () => {
      jest.spyOn(bookingModel, 'findOne').mockResolvedValue(mockBooking as any);

      await expect(service.createBooking(createDto, mockRequest as any))
        .rejects.toThrow(BadRequestException);
      await expect(service.createBooking(createDto, mockRequest as any))
        .rejects.toThrow('You have already booked this class');
    });

    it('should throw BadRequestException when user has insufficient credits', async () => {
      const poorUser = { ...mockUser, credits: 2 };
      const poorRequest = { user: poorUser };

      await expect(service.createBooking(createDto, poorRequest as any))
        .rejects.toThrow(BadRequestException);
      await expect(service.createBooking(createDto, poorRequest as any))
        .rejects.toThrow('Not enough credits');
    });

    it('should throw BadRequestException when there are overlapping bookings', async () => {
      const overlappingBooking = {
        ...mockBooking,
        startTime: new Date('2024-01-15T09:00:00.000Z'),
        endTime: new Date('2024-01-15T11:00:00.000Z'),
      };
      jest.spyOn(bookingModel, 'find').mockResolvedValue([overlappingBooking] as any);

      await expect(service.createBooking(createDto, mockRequest as any))
        .rejects.toThrow(BadRequestException);
      await expect(service.createBooking(createDto, mockRequest as any))
        .rejects.toThrow('Overlapping class booking not allowed');
    });
  });

  describe('cancel', () => {
    const bookingId = mockBooking._id.toString();

    beforeEach(() => {
      jest.spyOn(service, 'findOneById').mockResolvedValue(mockBooking as any);
      jest.spyOn(classesService, 'findOneById').mockResolvedValue(mockClass as any);
      jest.spyOn(usersService, 'update').mockResolvedValue(mockUser as any);
      jest.spyOn(service, 'remove').mockResolvedValue(true);
    });

    it('should cancel booking and refund credits when more than 2 hours before start', async () => {
      const futureStartTime = new Date();
      futureStartTime.setHours(futureStartTime.getHours() + 3); // 3 hours from now
      
      const futureBooking = { ...mockBooking, startTime: futureStartTime };
      jest.spyOn(service, 'findOneById').mockResolvedValue(futureBooking as any);

      const result = await service.cancel(bookingId);

      expect(usersService.update).toHaveBeenCalledWith(mockBooking.userId, {
        $inc: { credits: mockClass.creditCost },
      });
      expect(classesService.update).toHaveBeenCalledWith(mockBooking.classId.toString(), {
        $inc: { remainingCapacity: 1 },
      });
      expect(service.remove).toHaveBeenCalledWith(mockBooking._id);
      expect(result).toBe(true);
    });

    it('should cancel booking without refund when less than 2 hours before start', async () => {
      const nearStartTime = new Date();
      nearStartTime.setHours(nearStartTime.getHours() + 1); // 1 hour from now
      
      const nearBooking = { ...mockBooking, startTime: nearStartTime };
      jest.spyOn(service, 'findOneById').mockResolvedValue(nearBooking as any);

      const result = await service.cancel(bookingId);

      expect(usersService.update).not.toHaveBeenCalled();
      expect(classesService.update).toHaveBeenCalledWith(mockBooking.classId.toString(), {
        $inc: { remainingCapacity: 1 },
      });
      expect(result).toBe(true);
    });

    it('should throw NotFoundException when booking not found', async () => {
      jest.spyOn(service, 'findOneById').mockRejectedValue(new NotFoundException('Booking not found'));

      await expect(service.cancel(bookingId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneById', () => {
    const bookingId = mockBooking._id.toString();

    it('should return booking with populated data', async () => {
      const populatedResult = [{
        ...mockBooking,
        user: { name: 'Test User', email: 'test@example.com' },
        class: { title: 'Test Class', capacity: 30 },
      }];

      jest.spyOn(bookingModel, 'aggregate').mockResolvedValue(populatedResult);

      const result = await service.findOneById(bookingId);

      expect(bookingModel.aggregate).toHaveBeenCalled();
      expect(result).toEqual(populatedResult[0]);
    });

    it('should throw NotFoundException when booking not found', async () => {
      jest.spyOn(bookingModel, 'aggregate').mockResolvedValue([]);

      await expect(service.findOneById(bookingId))
        .rejects.toThrow(NotFoundException);
    });
  });
});
