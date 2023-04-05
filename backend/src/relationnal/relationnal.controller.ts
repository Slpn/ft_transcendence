import { Controller, Post, Request, Get,  Response, UseGuards} from '@nestjs/common';
import { RelationnalService } from './relationnal.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';

@Controller('relationnal')
export class RelationnalController {

    constructor(private relationnalService: RelationnalService,
                private userService: UserService
        ) {}
    @Post('/createFriendship')
    @UseGuards(JwtAuthGuard)
    async createFriendship(@Request() request, @Response() res) {
        const relationnal = await this.relationnalService.getRelationnalBySenderAndInvited(request.body.id1, request.body.id2);
        const relationnal2 = await this.relationnalService.getRelationnalBySenderAndInvited(request.body.id2, request.body.id1);

        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        if (relationnal[0] || relationnal2[0]) {
            return res.json({accepted: false});
        }
        await this.relationnalService.createRelationnal(request.body.id1, request.body.id2);
        await this.relationnalService.createRelationnal(request.body.id2, request.body.id1);
        return res.json({accepted: true});
    }

    @Post('/deleteFriendship')
    @UseGuards(JwtAuthGuard)
    async deleteFriendship(@Request() request, @Response() res) {
        const decodedToken = this.userService.decodeJwtToken(request.cookies.Auth);
        await this.relationnalService.deleteRelationnal(request.body.id, decodedToken.sub);
        await this.relationnalService.deleteRelationnal(decodedToken.sub, request.body.id);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json({deleted: true});
    }

    @Get('getFriends')
    @UseGuards(JwtAuthGuard)
    async getFriends(@Request() req, @Response() res){
        let friends_list: Array<User> = [];
        const decodedToken = await this.userService.decodeJwtToken(req.cookies.Auth);
        const relations = await this.relationnalService.getFriends(decodedToken.sub);
        let i: number = 0;
        while (i < relations.length)
        {
            friends_list[i] = await this.userService.getUserById(relations[i].friend);
            i++;
        }
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(friends_list);
    }
}
