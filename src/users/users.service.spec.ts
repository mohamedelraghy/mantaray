import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';

import { UsersService } from './users.service';
import { User, UserDoc } from './entities/user.entity';
import { RoleEnum } from './enums/role.enum';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: Model<UserDoc>;

  const mockUser = {
    _id: new Types.ObjectId(),
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    credits: 10,
    role: RoleEnum.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            aggregate: jest.fn(),
            countDocuments: jest.fn(),
            exists: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<UserDoc>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      email: 'newuser@example.com',
      name: 'New User',
      password: 'password123',
      role: RoleEnum.USER,
    };

    it('should create a user successfully', async () => {
      jest.spyOn(userModel, 'create').mockResolvedValue(mockUser as any);

      const result = await service.create(createDto);

      expect(userModel.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockUser);
    });

    it('should handle duplicate email error', async () => {
      const duplicateError = new Error('Duplicate key error');
      (duplicateError as any).code = 11000;
      jest.spyOn(userModel, 'create').mockRejectedValue(duplicateError);

      await expect(service.create(createDto))
        .rejects.toThrow();
    });
  });

  describe('findByEmail', () => {
    const email = 'test@example.com';

    it('should return user by email', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockUser as any);

      const result = await service.findByEmail(email);

      expect(userModel.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);

      await expect(service.findByEmail(email))
        .rejects.toThrow(NotFoundException);
      await expect(service.findByEmail(email))
        .rejects.toThrow(`User with email ${email} not found`);
    });
  });

  describe('findOneById', () => {
    const userId = mockUser._id.toString();

    it('should return user by id', async () => {
      jest.spyOn(userModel, 'findById').mockResolvedValue(mockUser as any);

      const result = await service.findOneById(userId);

      expect(userModel.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(userModel, 'findById').mockResolvedValue(null);

      await expect(service.findOneById(userId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const userId = mockUser._id.toString();
    const updateDto = {
      name: 'Updated Name',
      credits: 15,
    };

    it('should update user successfully', async () => {
      const updatedUser = { ...mockUser, ...updateDto };
      jest.spyOn(userModel, 'findByIdAndUpdate').mockResolvedValue(updatedUser as any);

      const result = await service.update(userId, updateDto);

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, updateDto, { new: true });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(userModel, 'findByIdAndUpdate').mockResolvedValue(null);

      await expect(service.update(userId, updateDto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    const userId = mockUser._id.toString();

    it('should remove user successfully', async () => {
      jest.spyOn(userModel, 'findByIdAndDelete').mockResolvedValue(mockUser as any);

      const result = await service.remove(userId);

      expect(userModel.findByIdAndDelete).toHaveBeenCalledWith(userId);
      expect(result).toBe(true);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(userModel, 'findByIdAndDelete').mockResolvedValue(null);

      await expect(service.remove(userId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated users with search functionality', async () => {
      const mockResult = {
        content: [mockUser],
        count: 1,
      };

      jest.spyOn(service, 'aggregate').mockResolvedValue(mockResult as any);

      const searchOptions = {
        offset: 0,
        size: 10,
        searchTerm: 'test',
      };

      const result = await service.findAll(searchOptions as any);

      expect(service.aggregate).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('should search by email and name', async () => {
      const mockResult = {
        content: [mockUser],
        count: 1,
      };

      jest.spyOn(service, 'aggregate').mockResolvedValue(mockResult as any);

      const searchOptions = {
        searchTerm: 'test@example.com',
      };

      await service.findAll(searchOptions as any);

      expect(service.aggregate).toHaveBeenCalled();
    });
  });

  describe('credit management', () => {
    it('should handle credit updates correctly', async () => {
      const userId = mockUser._id.toString();
      const creditUpdate = { $inc: { credits: 10 } };
      const updatedUser = { ...mockUser, credits: 20 };

      jest.spyOn(userModel, 'findByIdAndUpdate').mockResolvedValue(updatedUser as any);

      const result = await service.update(userId, creditUpdate);

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, creditUpdate, { new: true });
      expect(result.credits).toBe(20);
    });
  });
});
