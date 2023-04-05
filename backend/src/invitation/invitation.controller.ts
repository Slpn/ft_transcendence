import { Controller, Request, Response, Post, Get, UseGuards, forwardRef } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { InvitationService } from './invitation.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/user/user.entity';
import { RelationnalService } from 'src/relationnal/relationnal.service';
import { Invitation } from './invitation.entity';

@Controller('invitation')
export class InvitationController {
    constructor(private  invitationService: InvitationService,
                private userService: UserService,
        ) {}

    @Post('/inviteFriend')
    async inviteFriend(@Request() request, @Response() res) {
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        const invitation = await this.invitationService.getBySenderAndInvited(decodedToken.sub, request.body.id);
        const invitation2 = await this.invitationService.getBySenderAndInvited(request.body.id, decodedToken.sub);
        if (!invitation && !invitation2){
           await this.invitationService.createInvitation(decodedToken.sub, request.body.id);
        }
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json({message: "success"}); 
    }
    
    @Post('acceptInvitation')
    @UseGuards(JwtAuthGuard)
    async acceptInvite(@Request() request, @Response() res){
        const invitation: Invitation = await this.invitationService.acceptInvitation(request.body.invitation_id);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        if (invitation) {
            return res.json({invitation: invitation, accepted: true});
        }
        return res.json({invitation: invitation, accepted: false});
    }

    @Post('declineInvitation')
    @UseGuards(JwtAuthGuard)
    async declineInvite(@Request() request, @Response() res){
        const invitation: Invitation = await this.invitationService.acceptInvitation(request.body.invitation_id);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(invitation);
    }

    @Get('/listsInvite')
    @UseGuards(JwtAuthGuard)
    async listsInvite(@Request() request, @Response() res){
        let user_list: Array<User> = [];
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        const invitationList = await this.invitationService.getListInvitationById(decodedToken.sub);
        let i = 0;
        while (invitationList[i])
        {
            user_list[i] = await this.userService.getUserById(invitationList[i].sender);
            i++;
        }
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json({invitationsList: invitationList, users: user_list});
    }
}
