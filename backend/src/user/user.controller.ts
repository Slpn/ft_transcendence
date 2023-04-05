import { Controller, Get, Post, Body, Res, UseGuards, Request, UseInterceptors, UploadedFile, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Blocklist } from './banlist.entity';

import { FileInterceptor } from '@nestjs/platform-express';
import { createWriteStream } from 'fs';
import { join } from 'path';
import * as fs from 'fs';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Get()
  // findAll(): Promise<UserDto[]> {
  //   return this.userService.getAllUsers();
  // }

  @Post('/signup')
  async signup(
    @Body('login') login: string,
    @Body('username') username: string,
    @Body('password') password: string,
    @Body('email') email: string,
	@Body('avatar42') avatar42: string,
  @Res() res
  ){
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    return res.json(await this.userService.signup(login, username, password, email, avatar42));
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  async me(@Request() req, @Res() res): Promise<User> {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    const user: User = await this.userService.getUserById(req.user.id);
    res.json(user);
    return user
  }

  @Get('/getUserById/:id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param("id") id, @Request() req, @Res() res): Promise<User> {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    const user: User = await this.userService.getUserById(id);
    res.json(user);
    return user
  }

  @Get('/getUserByUsername/:username')
  @UseGuards(JwtAuthGuard)
  async getUserByUsername(@Param("username") username, @Request() req, @Res() res): Promise<User> {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    const user: User = await this.userService.getUserByUsername(username);
    res.json(user);
    return user
  }

  @Get('/signout')
  signout(@Res({ passthrough: true }) res): void {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.clearCookie('Auth');
  }

  @Post('/saveSettings')
  @UseGuards(JwtAuthGuard)
  async saveSettings(@Request() request, @Res() res) {
    const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
    const id : number = decodedToken.sub;

    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    if (request.body.username) {
      const userByUsername : User = await this.userService.getUserByUsername(request.body.username);
      if (userByUsername && userByUsername.username == request.body.username){
        return res.json({message: "username unavailable"});
      }
      this.userService.changeUsername(id, request.body.username);
    }
    if (request.body.email) {
      const userByEmail : User = await this.userService.getUserByEmail(request.body.email)
      if (userByEmail && userByEmail.email == request.body.email){
        return res.json({message: "email unavailable"});
      }
      this.userService.changeEmail(id, request.body.email);
    }
  }

  @Post('/twoFactorSwitch')
  @UseGuards(JwtAuthGuard)
  async twoFactorSwitch(@Request() request, @Res() res) {
    const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
    const id: number = decodedToken.sub;
    const user: User = await this.userService.twoFactorSwitch(id);
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    return res.json(user);
  }

  @Post('/searchUser')
  @UseGuards(JwtAuthGuard)
  async searchUser(@Request() request, @Res() res) {
    const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
    const id: number = decodedToken.sub;
    const users: User[] = await this.userService.searchUser(request.body.username);
    const i: number = 0;
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    return res.json({user: users});
  }

  @Post("/blockUser")
  @UseGuards(JwtAuthGuard)
  async blockUser(@Request() request, @Res() res){
    const blocked: number = request.body.blocked;
    const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
    const blocker: number = decodedToken.sub;
    const block = await this.userService.blockUser(blocker, blocked);
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.json(block);
  }

  @Post("/unblockUser")
  @UseGuards(JwtAuthGuard)
  async unblockUser(@Request() request, @Res() res){
    const blocked: number = request.body.blocked;
    const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
    const blocker: number = decodedToken.sub;
    const block = await this.userService.unblockUser(blocker, blocked);
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.json(block);
  }

  @Get('/getBlockByBothId/:id')
  @UseGuards(JwtAuthGuard)
  async getBlockListById(@Request() request, @Res() res, @Param("id") id){
    const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
    const blocked: number = id;
    const blocker: number = decodedToken.sub;
    const block: Blocklist = await this.userService.getBlockByBothId(blocker, blocked);
    let flag: number = 0;
    if (block) {
      flag = 1;
    }
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.json({flag: flag, block: block});
	}

	@Post('upload')
	@UseGuards(JwtAuthGuard)
  	@UseInterceptors(FileInterceptor('file'))
  	async uploadFile(@UploadedFile() file, @Request() request, @Res() res) {
	const decodedToken = this.userService.decodeJwtToken(request.cookies.Auth);
	const path : string = join(__dirname, '..', 'user', file.originalname);
    const writeStream = createWriteStream(path);
    writeStream.write(file.buffer);
    writeStream.end();
	res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    const uploadedFile = await this.userService.saveUploadedFile(decodedToken.sub, file.originalname);
    return res.json({ uploadedFile });
  	}

	@Post('upload/delete')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors()
	async deleteFile(@Request() request, @Res() res) {
	const decodedToken = this.userService.decodeJwtToken(request.cookies.Auth);
	res.header("Access-Control-Allow-Origin", "http://localhost:3000");
	const uploadedFile = await this.userService.removeUploadedFile(decodedToken.sub);
	return res.json({ uploadedFile });
	}

	@Get('upload/:name')
	@UseGuards(JwtAuthGuard)
	async serveImage(@Param('name') fileName: string, @Res() res: Response) {
	const fileStream = fs.createReadStream(`dist/user/${fileName}`);
	fileStream.on('error', () => {
		res.sendStatus(404);
	  });
	fileStream.pipe(res);
	res.header("Access-Control-Allow-Origin", "http://localhost:3000");
	}
  }


