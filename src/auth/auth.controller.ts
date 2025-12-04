import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { RequestWithUser } from '../core/interfaces/user-request.interface';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Signup endpoint' })
  async signup(@Body() signupDto: SignupDto) {
    try {
      const user = await this.authService.signup(signupDto);

      return { user };
    } catch (error) {
      if (error instanceof HttpException)
        throw new BadRequestException(error.getResponse());
      else throw new BadGatewayException(error.toString());
    }
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginDto })
  @ApiOperation({ summary: 'Login endpoint' })
  @Post('login')
  async login(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.addJwtToCookie(req, res);

    return { token: req.session.jwt, user: req.user };
  }

  private addJwtToCookie(req: RequestWithUser, res: Response) {
    try {
      const token = this.authService.generateJwtToken(req.user).access_token;
      req.session.jwt = token;
      res.cookie('jwt', token, { httpOnly: true });
    } catch (error) {
      throw new BadGatewayException(error.toString());
    }
  }
}
