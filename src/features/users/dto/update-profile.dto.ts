import { PartialType, OmitType } from '@nestjs/swagger';

import { CreateUserDto } from './create-user.dto';

export class UpdateProfileDto extends PartialType(OmitType(CreateUserDto, ['role', 'password'] as const)) {}
