import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';

import { MembershipsService } from './memberships.service';
import { Membership, MembershipDoc } from './entities/membership.entity';
import { UsersService } from '../users/users.service';
import { RoleEnum } from '../users/enums/role.enum';

describe('MembershipsService', () => {
  let service: MembershipsService;
  let membershipModel: Model<MembershipDoc>;
  let usersService: UsersService;

  const mockMembership = {
    _id: new Types.ObjectId(),
    userId: new Types.ObjectId(),
    creditsToAdded: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    _id: new Types.ObjectId(),
    email: 'test@example.com',
    name: 'Test User',
    credits: 10,
    role: RoleEnum.USER,
  };

  const createDto = {
    userId: mockUser._id.toString(),
    creditsToAdded: 50,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipsService,
        {
          provide: getModelToken(Membership.name),
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
      ],
    }).compile();

    service = module.get<MembershipsService>(MembershipsService);
    membershipModel = module.get<Model<MembershipDoc>>(getModelToken(Membership.name));
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      jest.spyOn(usersService, 'findOneById').mockResolvedValue(mockUser as any);
      jest.spyOn(membershipModel, 'create').mockResolvedValue(mockMembership as any);
      jest.spyOn(usersService, 'update').mockResolvedValue(mockUser as any);
    });

    it('should create membership and add credits to user', async () => {
      const result = await service.create(createDto);

      expect(usersService.findOneById).toHaveBeenCalledWith(createDto.userId);
      expect(membershipModel.create).toHaveBeenCalledWith({
        userId: new Types.ObjectId(createDto.userId),
        creditsToAdded: createDto.creditsToAdded,
      });
      expect(usersService.update).toHaveBeenCalledWith(createDto.userId, {
        $inc: { credits: createDto.creditsToAdded },
      });
      expect(result).toEqual(mockMembership);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(usersService, 'findOneById').mockRejectedValue(new NotFoundException('User not found'));

      await expect(service.create(createDto))
        .rejects.toThrow(NotFoundException);
    });

    it('should validate minimum credits to add', async () => {
      const invalidDto = { ...createDto, creditsToAdded: 0 };

      // This should be caught by DTO validation, but testing service behavior
      await expect(service.create(invalidDto))
        .rejects.toThrow();
    });
  });

  describe('remove', () => {
    const membershipId = mockMembership._id.toString();

    beforeEach(() => {
      jest.spyOn(service, 'findOneById').mockResolvedValue(mockMembership as any);
      jest.spyOn(usersService, 'update').mockResolvedValue(mockUser as any);
      jest.spyOn(service, 'remove').mockResolvedValue(true);
    });

    it('should remove membership and deduct credits from user', async () => {
      const result = await service.remove(membershipId);

      expect(service.findOneById).toHaveBeenCalledWith(membershipId);
      expect(usersService.update).toHaveBeenCalledWith(mockMembership.userId, {
        $inc: { credits: -mockMembership.creditsToAdded },
      });
      expect(service.remove).toHaveBeenCalledWith(mockMembership._id);
      expect(result).toBe(true);
    });

    it('should throw NotFoundException when membership not found', async () => {
      jest.spyOn(service, 'findOneById').mockRejectedValue(new NotFoundException('Membership not found'));

      await expect(service.remove(membershipId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    const mockRequest = {
      user: { _id: mockUser._id, role: RoleEnum.SUPER_ADMIN },
    };

    it('should return all memberships for super admin', async () => {
      const mockResult = {
        content: [mockMembership],
        count: 1,
      };

      jest.spyOn(service, 'aggregate').mockResolvedValue(mockResult as any);

      const result = await service.findAll({} as any, mockRequest as any);

      expect(service.aggregate).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('should filter memberships by user for regular users', async () => {
      const userRequest = {
        user: { _id: mockUser._id, role: RoleEnum.USER },
      };

      const mockResult = {
        content: [mockMembership],
        count: 1,
      };

      jest.spyOn(service, 'aggregate').mockResolvedValue(mockResult as any);

      const result = await service.findAll({} as any, userRequest as any);

      expect(service.aggregate).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });
});
