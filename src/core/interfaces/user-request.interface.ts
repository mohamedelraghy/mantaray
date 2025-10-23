import { Request } from 'express';

import { UserDoc } from '../../users/entities/user.entity';

export interface RequestWithUser extends Request {
  user: UserDoc;
  session: {
    jwt?: string;
  };
}
