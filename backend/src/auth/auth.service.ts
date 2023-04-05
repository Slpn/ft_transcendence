import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.entity';
import axios from 'axios';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userService.getUserByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async signin(user: User): Promise<string> {
    const payload = { username: user.username, sub: user.id };
    return this.jwtService.sign(payload);
  }

  async get_42access_token(code: string): Promise<string> {
    const data = {
      grant_type: 'authorization_code',
      client_id:process.env.AUTH_CLIENT_ID,
      client_secret:process.env.AUTH_CLIENT_SECRET,
      code: code,
      redirect_uri: 'http://localhost:3001/auth/signin42',
    };
    const ret = await axios.post('https://api.intra.42.fr/oauth/token', data, {
      headers: { 'Content-type': 'application/json' },
    });
    const token = ret.data.access_token;
    return token;
  }

  async check42User(login: string, username: string, email: string, avatar42:string){
    let user: User = null;
    user = await this.userService.getUserByUsername(username);
    if (!user) {
      await this.userService.signup(login, username, username, email, avatar42);
      return true;
    }
    return false;
  }

  async generateTwoFactorAuthenticationSecret(user: User) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'ft_transcendense', secret);
    await this.userService.setTwoFactorAuthenticationSecret(secret, user.id);
    return { secret, otpauthUrl };
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl);
  }

  isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: User) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.twoFactorAuthenticationSecret,
    });
  }
}

