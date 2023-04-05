import { Controller, Post, Request, Get,  Response, UseGuards, Param} from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserService } from 'src/user/user.service';
import { ChannelService } from '../channel/channel.service';
import { User } from 'src/user/user.entity';
import { Channel } from '../channel/channel.entity';
import { Message } from './message.entity';

@Controller('Message')
export class MessageController {

    constructor(private messageService: MessageService,
                private userService: UserService,
                private  channelService: ChannelService
        ) {}

    @Post('/createMessage')
    async createMessage(@Request() request, @Response() res, ) {
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        const ret: boolean = await this.messageService.createMessage(decodedToken.sub, request.body.channel_id, request.body.message);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        if (ret){
            return res.json(true);
        }
        return res.json(false);
        
    }

    @Post('/sendMessage')
    async sendMessage(@Request() request, @Response() res){


        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        const msg = await this.messageService.createMessage(decodedToken.sub, request.body.channel_id, request.body.message);
        // if (await this.messageService.sendSocketMessage(request.body.message, request.body.channel_id))
        // {
        // }
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json({message: request.body.message, channel_id: request.body.channel_id});
    }

    @Get('/getAllMessageByChannelId/:channelId')
    @UseGuards(JwtAuthGuard)
    async getAllMessageByChannelId(@Param("channelId") channelId, @Request() req, @Response() res){
        let userslist : Array<User> =[];
        const messageList = await this.messageService.getAllMessageByChannelId(channelId);
        let i = 0;
        while (messageList[i])
        {
            userslist[i] = await this.userService.getUserById(messageList[i].sender);
            i++;
        }
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json({messages: messageList, userslist: userslist});
    }

    @Get('getPrivateMessage/:user1/:user2')
    @UseGuards(JwtAuthGuard)
    async getPrivateMessage(@Param("user1") user1, @Param("user2") user2, @Request() req, @Response() res){
        const privateMessage = await this.messageService.getPrivateMessage(user1, user2);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(privateMessage);
    }
}
