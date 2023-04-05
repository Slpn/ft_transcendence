import { UserService } from 'src/user/user.service';
import { InvitationService } from './invitation.service';
export declare class InvitationController {
    private invitationService;
    private userService;
    constructor(invitationService: InvitationService, userService: UserService);
    inviteFriend(request: any, res: any): Promise<void>;
    acceptInvite(request: any, res: any): Promise<any>;
    declineInvite(request: any, res: any): Promise<any>;
    listsInvite(request: any, res: any): Promise<any>;
}
