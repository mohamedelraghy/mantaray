import {
  Body,
  Controller,
  HttpCode,
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
import { SuccessMessage } from 'src/core/decorators/success-message.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  @SuccessMessage('User signed up successfully')
  @ApiOperation({ summary: 'Signup endpoint' })
  async signup(@Body() signupDto: SignupDto) {
    return await this.authService.signup(signupDto);
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginDto })
  @SuccessMessage('User logged in successfully')
  @ApiOperation({ summary: 'Login endpoint' })
  @Post('login')
  async login(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const loginResult = await this.authService.login(req.user);
    
    req.session.jwt = loginResult.token;
    res.cookie('jwt', loginResult.token, { httpOnly: true });

    return loginResult;
  }
}
