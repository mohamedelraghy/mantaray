import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDoc } from '@features/users/entities/user.entity';
import { RoleEnum } from '@features/users/enums/role.enum';

@Injectable()
export class SuperAdminInitService {
  private readonly logger = new Logger(SuperAdminInitService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDoc>,
    private readonly configService: ConfigService
  ) {}

  async initializeSuperAdmin(): Promise<void> {
    try {
      const superAdminEmail =
        this.configService.get<string>('SUPER_ADMIN_EMAIL');
      const superAdminPassword = this.configService.get<string>(
        'SUPER_ADMIN_PASSWORD'
      );

      const existingSuperAdmin = await this.userModel.findOne({
        email: superAdminEmail,
        role: RoleEnum.SUPER_ADMIN
      });

      if (existingSuperAdmin) {
        this.logger.log(
          `Super admin user already exists with email: ${superAdminEmail}`
        );
        return;
      }

      const superAdminData = {
        email: superAdminEmail,
        password: superAdminPassword,
        name: 'Super Admin',
        role: RoleEnum.SUPER_ADMIN,
        credits: 0
      };

      await this.userModel.create(superAdminData);

      this.logger.log(
        `Super admin user created successfully with email: ${superAdminEmail}`
      );
    } catch (error) {
      this.logger.error('Failed to initialize super admin:', error);
      throw error;
    }
  }

  getSuperAdminCredentials(): { email: string; password: string } {
    return {
      email: this.configService.get<string>('SUPER_ADMIN_EMAIL')!,
      password: this.configService.get<string>('SUPER_ADMIN_PASSWORD')!
    };
  }
}
