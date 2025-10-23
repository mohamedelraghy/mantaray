import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ConfigService } from '../../config/config.services';
import { User, UserDoc } from '../../users/entities/user.entity';
import { RoleEnum } from '../../users/enums/role.enum';

@Injectable()
export class SuperAdminInitService {
  private readonly logger = new Logger(SuperAdminInitService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDoc>,
    private readonly configService: ConfigService,
  ) {}

  async initializeSuperAdmin(): Promise<void> {
    try {
      const superAdminEmail = this.configService.superAdminEmail;
      const superAdminPassword = this.configService.superAdminPassword;

      // Check if super admin already exists
      const existingSuperAdmin = await this.userModel.findOne({
        email: superAdminEmail,
        role: RoleEnum.SUPER_ADMIN,
      });

      if (existingSuperAdmin) {
        this.logger.log(
          `Super admin user already exists with email: ${superAdminEmail}`,
        );
        return;
      }

      // Create super admin user
      const superAdminData = {
        email: superAdminEmail,
        password: superAdminPassword,
        name: 'Super Admin',
        role: RoleEnum.SUPER_ADMIN,
        credits: 0,
      };

      await this.userModel.create(superAdminData);

      this.logger.log(
        `Super admin user created successfully with email: ${superAdminEmail}`,
      );
    } catch (error) {
      this.logger.error('Failed to initialize super admin:', error);
      throw error;
    }
  }

  getSuperAdminCredentials(): { email: string; password: string } {
    return {
      email: this.configService.superAdminEmail,
      password: this.configService.superAdminPassword,
    };
  }
}
