import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation } from './invitation.entity';

@Injectable()
export class InvitationService {
    constructor(@InjectRepository(Invitation) private invitationRepository: Repository<Invitation>) {}
    

    //cree une invitation 
    async createInvitation(senderId: number, invitedId: number): Promise<boolean>
    {
      try {
          const invitation = await this.invitationRepository.create();
  
          invitation.sender = senderId;
          invitation.invited = invitedId;
          invitation.accepted = 0;
        
          await this.invitationRepository.save(invitation);
          
          return true;
      } catch (error) {
          return false;
      }
    }

    async getById(invitation_id: number): Promise<Invitation> {
        return this.invitationRepository.findOneBy({id: invitation_id});
    }

    async getBySenderAndInvited(sender: number, invited: number): Promise<Invitation> {
        return this.invitationRepository.findOneBy({sender: sender, invited: invited, accepted: 0});
    }

    async deleteById(invitation_id: number){
        this.invitationRepository.delete(invitation_id);
    }

    async getListInvitationById(id : number){
        return this.invitationRepository.find({where: [{invited: id, accepted: 0}]});
    }

    async acceptInvitation(id: number) {
        const invitation: Invitation = await this.getById(id);
        invitation.accepted = 1;
        return this.invitationRepository.save(invitation);
    }

    async declineInvitation(id: number) {
        const invitation: Invitation = await this.getById(id);
        return this.invitationRepository.delete(invitation);
    }

    
}
