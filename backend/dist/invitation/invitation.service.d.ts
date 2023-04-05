import { Repository } from 'typeorm';
import { Invitation } from './invitation.entity';
export declare class InvitationService {
    private invitationRepository;
    constructor(invitationRepository: Repository<Invitation>);
    createInvitation(senderId: number, invitedId: number): Promise<boolean>;
    getById(invitation_id: number): Promise<Invitation>;
    getBySenderAndInvited(sender: number, invited: number): Promise<Invitation>;
    deleteById(invitation_id: number): Promise<void>;
    getListInvitationById(id: number): Promise<Invitation[]>;
    acceptInvitation(id: number): Promise<Invitation>;
    declineInvitation(id: number): Promise<import("typeorm").DeleteResult>;
}
