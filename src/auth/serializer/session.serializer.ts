import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  serializeUser(user: any, done: Function) {
    done(null, user);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  deserializeUser(payload: any, done: Function) {
    done(null, payload);
  }
}
