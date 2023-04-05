import { Query } from '@nestjs/common';
import { Controller, Post, UseGuards, Request, Get, Res, UnauthorizedException} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service'
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import axios from 'axios';
import { User } from 'src/user/user.entity';
import * as crypto from 'crypto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,
              private userService: UserService) {}

  @Post('/signin')
  async signin(@Request() req, @Res({ passthrough: true }) res) {
    let user = await this.authService.validateUser(req.body.username, req.body.password);
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    if (user != null) {
      if (user.twoFactorAuthEnabled == 1) {
        const loginChallenge = crypto.randomUUID();
        user = await this.userService.setLoginChallenge(loginChallenge, user.id);
        res.json({state: "success", loginChallenge: loginChallenge});
      }
      else {
        const token = await this.authService.signin(user);
        res.cookie('Auth', token);
      }
    }
    else {
      res.json({state: 'failure', message: "Wrong login or password"});
    }
  }

  @Get('/signin42')
  async signin42(@Query() query, @Res() res): Promise<any> {
    const code = query.code;
    const token = await this.authService.get_42access_token(code);
    const user_data = await axios.get(
      'https://api.intra.42.fr/v2/me?access_token=' + token,
      { headers: { 'Content-type': 'application/json' } },
    );
    await this.authService.check42User(
      user_data.data.login,
      user_data.data.login,
      user_data.data.email,
	    user_data.data.image.link,
    );
    let user = await this.userService.getUserByLogin(user_data.data.login);
    if (user.twoFactorAuthEnabled == 1) {
      const loginChallenge = crypto.randomUUID();
      user = await this.userService.setLoginChallenge(loginChallenge, user.id);
      return res.redirect('http://localhost:3000/user/2faSignin?loginchallenge='+loginChallenge);
    }
    const jwtToken = await this.authService.signin(user);
    res.cookie('Auth', jwtToken);
    return res.redirect('http://localhost:3000/home');
  }

  @Post('/qrcode')
  async getQrcode(@Request() req) {
    const loginchallenge = req.body.loginchallenge;
    let user = await this.userService.getUserByLoginChallenge(loginchallenge);
    if (!user)
      throw new UnauthorizedException();
    if (user.qrcode)
      return null;
    const tfaObject = await this.authService.generateTwoFactorAuthenticationSecret(user);
    user = await this.userService.setTwoFactorAuthenticationSecret(tfaObject.secret, user.id);
    const qrcode = await this.authService.generateQrCodeDataURL(tfaObject.otpauthUrl);
    if (qrcode)
      await this.userService.addQrcode(qrcode, user.id);
    return qrcode;
  }

  @Post('/verifyTwoFactorCode')
  async verifytwoFactorCode(@Request() req, @Res() res) {
    const code : string = req.body.code;
    const user : User = await this.userService.getUserByLoginChallenge(req.body.loginchallenge)
    const ret = await this.authService.isTwoFactorAuthenticationCodeValid(code, user);
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    if (ret) {
      const jwtToken = await this.authService.signin(user);
      res.cookie('Auth', jwtToken);
      return res.json({message: "success"});
    }
    else {
      return res.json({message: "failure"});
    }

  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  getProfile(@Request() req) {
    return JSON.stringify(req.user);
  }
}

