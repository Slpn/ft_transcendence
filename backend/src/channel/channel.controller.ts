import { Controller, Request, Response, Post, Get, UseGuards, Param } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { ChannelService } from './channel.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { compareSync } from 'bcrypt';
import {User } from '../user/user.entity'
import { Channel } from './channel.entity';

@Controller('channel')
export class ChannelController {
    constructor(private  channelService: ChannelService,
                private userService: UserService
        ) {}

    @Post('/createChannel')
    @UseGuards(JwtAuthGuard)
    async createChannel(@Request() request, @Response() res) {
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        const chan = await this.channelService.createChannel(request.body.nameChannel, request.body.passwordChannel, request.body.isPrivate);
        await this.channelService.createRelationnalChannel(chan.id, decodedToken.sub);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json({message: "success"});
    }

    @Get('/getChannel/:channelId')
    @UseGuards(JwtAuthGuard)
    async getChannel(@Request() request, @Response() res, @Param("channelId") channelId) {
        const channel: Channel = await this.channelService.getChannelById(channelId);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(channel);
    }


    @Get('/getChannels')
    @UseGuards(JwtAuthGuard)
    async getChannels(@Request() request, @Response() res) {
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        const channel: Channel[] = await this.channelService.getAllChannels();
        let i = 0;
        while (channel[i]) {
            if (await this.channelService.getBanByUserAndChannel(decodedToken.sub, channel[i].id)){
                await channel.splice(i, 1);
            }
            i++;
        }
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(channel);
    }

    @Get('/getPublicChannels')
    @UseGuards(JwtAuthGuard)
    async getPublicChannels( @Response() res) {
        const channel: Channel[] = await this.channelService.getPublicChannels();
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(channel);
    }

    @Get('/getPrivateChannels')
    @UseGuards(JwtAuthGuard)
    async getPrivateChannels(@Param("id") id, @Request() request, @Response() res) {
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        const channel: Channel[] = await this.channelService.getPrivateChannels(decodedToken.sub);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(channel);
    }

    @Get('/getProtectedChannels')
    @UseGuards(JwtAuthGuard)
    async getProtectedChannels(@Request() request, @Response() res) {
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        const channel: Channel[] = await this.channelService.getProtectedChannels();
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(channel);
    }

    @Get('/getChannelOwner/:channel_id')
    @UseGuards(JwtAuthGuard)
    async getChannelOwner(@Response() res, @Param("channel_id") channel_id) {
        const owner = await this.channelService.getOwner(channel_id);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(owner);
    }

    @Get('/getChannelAdmins/:channel_id')
    @UseGuards(JwtAuthGuard)
    async getChannelAdmins(@Response() res, @Param("channel_id") channel_id) {
        const admins = await this.channelService.getAdmins(channel_id);
        const adminsUsers = [];
        let i: number = 0;
        while (admins[i]) {
            adminsUsers[i] = await this.userService.getUserById(admins[i].user_id);
            i++;
        }
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(adminsUsers);
    }

    @Get('/getBannedUsers/:channel_id')
    @UseGuards(JwtAuthGuard)
    async getBannedUsers(@Response() res, @Param("channel_id") channel_id) {
        const bannedUsers = await this.channelService.getBannedUsers(channel_id);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(bannedUsers);
    }

    @Post('/changeName')
    @UseGuards(JwtAuthGuard)
    async changeName(@Request() request, @Response() res, @Param("channel_id") channel_id) {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json(await this.channelService.changeName(request.body.channel_id, request.body.name));
    }

    @Get('/getMutedUsers/:channel_id')
    @UseGuards(JwtAuthGuard)
    async getMutedUsers(@Response() res, @Param("channel_id") channel_id) {
        const mutedUsers = await this.channelService.getMutedUsers(channel_id);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(mutedUsers);
    }

    @Get('/listsUserInChannel/:channelId')
    @UseGuards(JwtAuthGuard)
    async listsUserInChannel(@Param("channelId") channelId, @Request() request, @Response() res) {
        let userlist: Array<User> = [];        //retrouve le channel en fonction de son nom
        const channel = await this.channelService.getChannelById(channelId);
        //recuperer les users de se channel 
        const UserList = await this.channelService.getAllUserInChannel(channel.id);
        //lister les users de ce channel dans userlist
        let i = 0;
        while (UserList[i])
        {
            userlist[i] = await this.userService.getUserById(UserList[i].user_id);
            i++;
        }
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        //retourner cette list
        return res.json({userlist});
    }

    @Post("/checkPassword")
    @UseGuards(JwtAuthGuard)
    async checkPassword(@Request() request, @Response() res) {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json( await this.channelService.checkPassword(request.body.channel_id, request.body.password));
    }

    @Post("/promoteToAdmin")
    @UseGuards(JwtAuthGuard)
    async promoteToAdmin(@Request() request, @Response() res) {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(await this.channelService.promoteToAdmin(request.body.channel_id, request.body.user_id));
    }

    @Post("/demoteToUser")
    @UseGuards(JwtAuthGuard)
    async demoteToUser(@Request() request, @Response() res) {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(await this.channelService.demoteToUser(request.body.channel_id, request.body.user_id));

    }

    @Get("/getBanByUserAndChannel/:id")
    @UseGuards(JwtAuthGuard)
    async getBanByUserAndChannel(@Param("id") id, @Request() request, @Response() res) {
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json( await this.channelService.getBanByUserAndChannel(decodedToken.sub, id));
    }


    @Post('/muteUser')
    @UseGuards(JwtAuthGuard)
    async muteUser(@Request() request, @Response() res){
        const mute = await this.channelService.muteUser(request.body.user_id, request.body.channel_id);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json(mute);
    }

    @Post('/unmuteUser')
    @UseGuards(JwtAuthGuard)
    async unmuteUser(@Request() request, @Response() res){
        const unmute = await this.channelService.unmuteUser(request.body.user_id, request.body.channel_id);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json(unmute);
    }

    @Post('/banUser')
    @UseGuards(JwtAuthGuard)
    async banUser(@Request() request, @Response() res){
        const ban = await this.channelService.banUser(request.body.user_id, request.body.channel_id);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json(ban);
    }


    @Get('/checkUnbanUser/:channel_id')
    @UseGuards(JwtAuthGuard)
    async checkUnbanUser(@Param("channel_id") id, @Request() request, @Response() res){
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        const check = await this.channelService.checkUnbanUser(decodedToken.sub, id);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json({message: check});
    }


    @Post('/unbanUser')
    @UseGuards(JwtAuthGuard)
    async unbanUser(@Request() request, @Response() res){
        const unban = await this.channelService.unbanUser(request.body.user_id, request.body.channel_id);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json(unban);
    }


    @Post('/resetPassword')
    @UseGuards(JwtAuthGuard)
    async resetPassword(@Request() request, @Response() res){
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json(await this.channelService.resetPassword(request.body.channel_id));
    }

    @Post('/changePassword')
    @UseGuards(JwtAuthGuard)
    async changePassword(@Request() request, @Response() res){
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json(await this.channelService.changePassword(request.body.channel_id, request.body.password));
    }

    @Post('/switchToPrivate')
    @UseGuards(JwtAuthGuard)
    async switchToPrivate(@Request() request, @Response() res){
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json(await this.channelService.switchToPrivate(request.body.channel_id));
    }

    @Post('/switchToPublic')
    @UseGuards(JwtAuthGuard)
    async switchToPublic(@Request() request, @Response() res){
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json(await this.channelService.switchToPublic(request.body.channel_id));
    }

}
