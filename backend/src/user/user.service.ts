import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {Like} from 'typeorm';
import { User } from './user.entity';
import { Blocklist } from './banlist.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UserService {
  usersChannelMap(usersChannelMap: any) {
      throw new Error("Method not implemented.");
  }
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Blocklist) private banlistRepository: Repository<Blocklist>,
    private jwtService: JwtService,
  ) {}

  // getAllUsers(): Promise<User[]> {
  //   return this.usersRepository.find();
  // }

  getUserById(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  async getUserByUsername(username: string): Promise<User> {
    return await this.usersRepository.findOne({
      where: [{ username: username }],
    });
  }

  async getUserByLogin(login: string): Promise<User> {
    return await this.usersRepository.findOne({
      where: [{ login: login }],
    });
  }

  async searchUser(user: string){
    return await this.usersRepository.find({ where: { username: Like(`${user}%`) }});
  }

  async getUserByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOne({
      where: [{ email: email }],
    });
  }

  async getUserByLoginChallenge(login: string): Promise<User> {
    return await this.usersRepository.findOne({
      where: [{ loginChallenge: login }],
    });
  }

  async signup(
    login: string,
    username: string,
    password: string,
    email: string,
	avatar42: string,
  ){
    const checkLogin = await this.usersRepository.findOne({where: {login: login}});
    const checkUsername = await this.usersRepository.findOne({where: {username: username}});
    const checkMail = await this.usersRepository.findOne({where: {email: email}});
    if (checkLogin || checkUsername || checkMail) {
      return {state: false, message: "Loggin or email already used"};
    }
    const saltOrRounds = 10;
    const hashed_password = await bcrypt.hash(password, saltOrRounds);
    const newUser = await this.usersRepository.create({
      login,
      username,
      email,
      password: hashed_password,
	    avatar42,
    });
    await this.usersRepository.save(newUser);
    return {state: true, message: "Account created"};
  }

  decodeJwtToken(token: string){
    const decodedJwtAccessToken  = this.jwtService.decode(token);
    return decodedJwtAccessToken;
  }

  async changeUsername(id: number, username: string) : Promise<User> {
    const user : User = await this.getUserById(id);
    user.username = username;
    await this.usersRepository.save(user);
    return user;
  }

  async changeEmail(id: number, email: string) : Promise<User> {
    const user : User = await this.getUserById(id);
    user.email = email;
    await this.usersRepository.save(user);
    return user;
  }

  async setTwoFactorAuthenticationSecret(secret: string, user_id: number): Promise<User> {
    const user : User = await this.getUserById(user_id);
    user.twoFactorAuthenticationSecret = secret;
    await this.usersRepository.save(user);
    return user;
  }

  async setLoginChallenge(loginChallenge: string, user_id: number): Promise<User> {
    const user : User = await this.getUserById(user_id);
    user.loginChallenge = loginChallenge;
    await this.usersRepository.save(user);
    return user;
  }

  async twoFactorSwitch(user_id: number): Promise<User>{
    const user : User = await this.getUserById(user_id);
    if (user.twoFactorAuthEnabled == 1) {
      user.twoFactorAuthEnabled = 0;
    }
    else {
      user.twoFactorAuthEnabled = 1
    }
    await this.usersRepository.save(user);
    return user;
  }

  async blockUser(blocker: number, blocked: number) {
    const block: Blocklist = await this.banlistRepository.create({
      blocker: blocker,
      blocked: blocked
    })
    await this.banlistRepository.save(block);
    return (block);
  }

  async unblockUser(blocker: number, blocked: number) {
    const block = await this.banlistRepository.findOne({where : {blocker: blocker, blocked: blocked}});
    this.banlistRepository.delete(block); 
    return (block);
  }

  async getBlockByBothId(blocker: number, blocked: number){
    const block = await this.banlistRepository.findOne({where : {blocker: blocker, blocked: blocked}});
    return (block);
  }

  async saveUploadedFile(id : number, path: string): Promise<User> {
	const user : User = await this.getUserById(id);
    user.avatar = path;
    await this.usersRepository.save(user);
    return user;
  }

  async removeUploadedFile(id : number): Promise<User> {
	const user : User = await this.getUserById(id);
    user.avatar = "";
    await this.usersRepository.save(user);
    return user;
  }

  async addXp(id: number) {
    const user =  await this.getUserById(id);
    if (user) {
      user.xp += 25;
      this.usersRepository.save(user);
    }
  }

  async addWin(id: number) {
    const user =  await this.getUserById(id);
    if (user) {
      user.gameWon += 1;
      this.usersRepository.save(user);
    }
  }

  async addLoose(id: number) {
    const user =  await this.getUserById(id);
    if (user) {
      user.gameLost += 1;
      this.usersRepository.save(user);
    }
  }

  async addQrcode(code: string, id : number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (user) {
      user.qrcode = code;
      await this.usersRepository.save(user);
    }
  }
}
