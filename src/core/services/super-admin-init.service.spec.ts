import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { SuperAdminInitService } from './super-admin-init.service';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDoc } from '../../users/entities/user.entity';
import { RoleEnum } from '../../users/enums/role.enum';

describe('SuperAdminInitService', () => {
  let service: SuperAdminInitService;
  let userModel: Model<UserDoc>;
  let configService: ConfigService;

  const mockSuperAdmin = {
    _id: new Types.ObjectId(),
    email: 'admin@example.com',
    name: 'Super Admin',
    password: 'hashedPassword',
    credits: 0,
    role: RoleEnum.SUPER_ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuperAdminInitService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                'SUPER_ADMIN_EMAIL': 'admin@example.com',
                'SUPER_ADMIN_PASSWORD': 'admin123',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SuperAdminInitService>(SuperAdminInitService);
    userModel = module.get<Model<UserDoc>>(getModelToken(User.name));
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initializeSuperAdmin', () => {
    it('should create super admin when none exists', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);
      jest.spyOn(userModel, 'create').mockResolvedValue(mockSuperAdmin as any);
      jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await service.initializeSuperAdmin();

      expect(userModel.findOne).toHaveBeenCalledWith({
        email: configService.get('SUPER_ADMIN_EMAIL'),
        role: RoleEnum.SUPER_ADMIN,
      });
      expect(userModel.create).toHaveBeenCalledWith({
        email: configService.get('SUPER_ADMIN_EMAIL'),
        password: configService.get('SUPER_ADMIN_PASSWORD'),
        name: 'Super Admin',
        role: RoleEnum.SUPER_ADMIN,
        credits: 0,
      });
    });

    it('should not create super admin when one already exists', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockSuperAdmin as any);
      jest.spyOn(userModel, 'create').mockResolvedValue(mockSuperAdmin as any);
      jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await service.initializeSuperAdmin();

      expect(userModel.findOne).toHaveBeenCalledWith({
        email: configService.get('SUPER_ADMIN_EMAIL'),
        role: RoleEnum.SUPER_ADMIN,
      });
      expect(userModel.create).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      jest.spyOn(userModel, 'findOne').mockRejectedValue(new Error('Database error'));
      jest.spyOn(Logger.prototype, 'error').mockImplementation();

      await expect(service.initializeSuperAdmin())
        .rejects.toThrow('Database error');
    });
  });

  describe('getSuperAdminCredentials', () => {
    it('should return super admin credentials from config', () => {
      const credentials = service.getSuperAdminCredentials();

      expect(credentials).toEqual({
        email: configService.get('SUPER_ADMIN_EMAIL'),
        password: configService.get('SUPER_ADMIN_PASSWORD'),
      });
    });
  });

  describe('environment configuration', () => {
    it('should use environment variables for super admin credentials', () => {
      expect(configService.get('SUPER_ADMIN_EMAIL')).toBe('admin@example.com');
      expect(configService.get('SUPER_ADMIN_PASSWORD')).toBe('admin123');
    });
  });
});
