import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvitationService } from 'src/invitation/invitation.service';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { Relationnal } from './relationnal.entity';


@Injectable()
export class RelationnalService{
    constructor(
        @InjectRepository(Relationnal) private relationnalRepository: Repository<Relationnal>,
        private invitationService: InvitationService,
        private readonly userService: UserService
      ) {}

    //cree une relation avec l'envoyer et le receveur 
    async createRelationnal(user: number, friend: number): Promise<boolean>
    {
        const relationnal = this.relationnalRepository.create()

        relationnal.user = user
        relationnal.friend = friend

        await this.relationnalRepository.insert(relationnal)
        return true
    }


    async deleteRelationnal(user: number, friend: number): Promise<boolean>
    {
        const relationnals = await this.relationnalRepository.findOne({where: {user: user, friend: friend}})
        if (relationnals) {
          await this.relationnalRepository.delete(relationnals);
          return true;
        }
        return false;
    }
    //cree 2 fois pour aue les deux individus aient l'information 
    async addFriend(user:number, friend:number): Promise<boolean>
    {
        if (!user || !friend)
            return false
        await this.createRelationnal(user,friend)
        await this.createRelationnal(friend,user)
        return true

    }

    //change le status de l'invitation en accepte ou pas 
      async updateInvitation(invitionId: number, reply: boolean): Promise<boolean>
      {
        //cree l'invitation pour la recevoir hein sois pas bete
        const invitation = await this.invitationService.getById(invitionId)
        if (!invitation){
            return false
        }
        if (reply == true){
            await this.addFriend(invitation.invited,invitation.sender)
        }
        //await this.invitationRepository.update(invitionId, { accepted: reply })
        await this.invitationService.deleteById(invitionId);
        return true
      }
      
      async getFriends(user_id: number) {
        const relations = await this.relationnalRepository.find({where: {user: user_id}});
        return relations;
      }

      async getRelationnalBySenderAndInvited(sender: number, invited: number) {
        const relations = await this.relationnalRepository.find({where: {user: sender, friend: invited}});
        return relations;
      }

      // async getFriendsFromRelationnal(relations: any): Promise<any> {
      //   const friends = relations.map(async (info) => {
      //       await this.userService.getUserById(info.friend);
      //    });
      //    return friends;
      // }
}
