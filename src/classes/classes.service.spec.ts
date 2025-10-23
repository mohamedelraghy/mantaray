import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';

import { ClassesService } from './classes.service';
import { Class, ClassDoc } from './entities/class.entity';

describe('ClassesService', () => {
  let service: ClassesService;
  let classModel: Model<ClassDoc>;

  const mockClass = {
    _id: new Types.ObjectId(),
    title: 'Test Class',
    description: 'Test Description',
    startTime: new Date('2024-01-15T10:00:00.000Z'),
    endTime: new Date('2024-01-15T12:00:00.000Z'),
    capacity: 30,
    remainingCapacity: 30,
    creditCost: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        {
          provide: getModelToken(Class.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            aggregate: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
    classModel = module.get<Model<ClassDoc>>(getModelToken(Class.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      title: 'New Class',
      description: 'New Description',
      startTime: '2024-01-15T10:00:00.000Z',
      endTime: '2024-01-15T12:00:00.000Z',
      capacity: 25,
      creditCost: 10,
    };

    it('should create a class successfully', async () => {
      jest.spyOn(classModel, 'create').mockResolvedValue(mockClass as any);

      const result = await service.create(createDto);

      expect(classModel.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockClass);
    });

    it('should handle creation errors', async () => {
      jest.spyOn(classModel, 'create').mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto))
        .rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return paginated classes with search functionality', async () => {
      const mockResult = {
        content: [mockClass],
        count: 1,
      };

      jest.spyOn(service, 'aggregate').mockResolvedValue(mockResult as any);

      const searchOptions = {
        offset: 0,
        size: 10,
        searchTerm: 'Test',
      };

      const result = await service.findAll(searchOptions as any);

      expect(service.aggregate).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('should handle empty search results', async () => {
      const mockResult = {
        content: [],
        count: 0,
      };

      jest.spyOn(service, 'aggregate').mockResolvedValue(mockResult as any);

      const result = await service.findAll({} as any);

      expect(result).toEqual(mockResult);
    });
  });

  describe('findOneById', () => {
    const classId = mockClass._id.toString();

    it('should return class by id', async () => {
      jest.spyOn(classModel, 'findById').mockResolvedValue(mockClass as any);

      const result = await service.findOneById(classId);

      expect(classModel.findById).toHaveBeenCalledWith(classId);
      expect(result).toEqual(mockClass);
    });

    it('should throw NotFoundException when class not found', async () => {
      jest.spyOn(classModel, 'findById').mockResolvedValue(null);

      await expect(service.findOneById(classId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const classId = mockClass._id.toString();
    const updateDto = {
      title: 'Updated Class',
      capacity: 35,
    };

    it('should update class successfully', async () => {
      const updatedClass = { ...mockClass, ...updateDto };
      jest.spyOn(classModel, 'findByIdAndUpdate').mockResolvedValue(updatedClass as any);

      const result = await service.update(classId, updateDto);

      expect(classModel.findByIdAndUpdate).toHaveBeenCalledWith(classId, updateDto, { new: true });
      expect(result).toEqual(updatedClass);
    });

    it('should throw NotFoundException when class not found', async () => {
      jest.spyOn(classModel, 'findByIdAndUpdate').mockResolvedValue(null);

      await expect(service.update(classId, updateDto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    const classId = mockClass._id.toString();

    it('should remove class successfully', async () => {
      jest.spyOn(classModel, 'findByIdAndDelete').mockResolvedValue(mockClass as any);

      const result = await service.remove(classId);

      expect(classModel.findByIdAndDelete).toHaveBeenCalledWith(classId);
      expect(result).toBe(true);
    });

    it('should throw NotFoundException when class not found', async () => {
      jest.spyOn(classModel, 'findByIdAndDelete').mockResolvedValue(null);

      await expect(service.remove(classId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('search functionality', () => {
    it('should search by title and description', async () => {
      const mockResult = {
        content: [mockClass],
        count: 1,
      };

      jest.spyOn(service, 'aggregate').mockResolvedValue(mockResult as any);

      const searchOptions = {
        searchTerm: 'Test',
      };

      await service.findAll(searchOptions as any);

      expect(service.aggregate).toHaveBeenCalled();
    });
  });
});
