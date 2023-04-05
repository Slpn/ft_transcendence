import { RelationnalService } from './relationnal.service';
import { UserService } from 'src/user/user.service';
export declare class RelationnalController {
    private relationnalService;
    private userService;
    constructor(relationnalService: RelationnalService, userService: UserService);
    createFriendship(request: any, res: any): Promise<any>;
    deleteFriendship(request: any, res: any): Promise<any>;
    getFriends(req: any, res: any): Promise<any>;
}
