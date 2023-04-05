import { InvitationService } from 'src/invitation/invitation.service';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { Relationnal } from './relationnal.entity';
export declare class RelationnalService {
    private relationnalRepository;
    private invitationService;
    private readonly userService;
    constructor(relationnalRepository: Repository<Relationnal>, invitationService: InvitationService, userService: UserService);
    createRelationnal(user: number, friend: number): Promise<boolean>;
    deleteRelationnal(user: number, friend: number): Promise<boolean>;
    addFriend(user: number, friend: number): Promise<boolean>;
    updateInvitation(invitionId: number, reply: boolean): Promise<boolean>;
    getFriends(user_id: number): Promise<Relationnal[]>;
    getRelationnalBySenderAndInvited(sender: number, invited: number): Promise<Relationnal[]>;
}
