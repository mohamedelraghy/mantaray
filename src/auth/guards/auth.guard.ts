import {
  BadGatewayException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '../../config/config.services';


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authorization token missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.jwtSecret,
      });
      request.user = payload;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.getResponse());
      } else {
        throw new BadGatewayException(error.toString());
      }
    }
  } 

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
