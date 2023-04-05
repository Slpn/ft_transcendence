import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Channel } from './channel.entity';
import { UserService } from 'src/user/user.service';
import {RelationnalChannel} from './relationnalChannel.entity';
import { MuteList } from './mutelist.entity';
import { BanList } from './banlist.entity';
import { Relationnal } from 'src/relationnal/relationnal.entity';
import * as bcrypt from 'bcrypt';


@Injectable()
export class ChannelService {
    constructor(@InjectRepository(Channel) private channelRepository: Repository<Channel>, private readonly userService: UserService,
          @InjectRepository(RelationnalChannel) private relationnalChannelRepository: Repository<RelationnalChannel>,
          @InjectRepository(Relationnal) private relationnalRepository: Repository<Relationnal>,
          @InjectRepository(MuteList) private muteListRepository: Repository<MuteList>,
          @InjectRepository(BanList) private banListRepository: Repository<BanList>,
    ) {}
    

    //cree un channel avec minimum deux client .
    async createChannel(channel_name: string, password: string, isPrivate: boolean): Promise<Channel>
    {
        const channel = await this.channelRepository.create();
        if (!channel_name)
        {
            return channel;
        }
        try {
            channel.channel_name = channel_name;
            if (password) {
                const saltOrRounds = 10;
                const hashed_password = await bcrypt.hash(password, saltOrRounds);
                channel.password = hashed_password;
                await this.channelRepository.save(channel);
            }
            else {
                channel.type = isPrivate;
                await this.channelRepository.save(channel);
            }
            return channel
        } catch (error) {
            return channel
        }
    }

    //


    //return le channel en fonction de son id 
    async getChannelById(channel_id: number): Promise<Channel> {
        return await this.channelRepository.findOneBy({id: channel_id});
    }

    async getAllChannels(): Promise<Channel[]> {
        return await this.channelRepository.find();
    }

    async getPublicChannels(): Promise<Channel[]> {
      return await this.channelRepository.find({where: {type: false}});
    }

    async getProtectedChannels(): Promise<Channel[]> {
      return await this.channelRepository.find({where: {password: Not(IsNull())}});
    }

    async getPrivateChannels(user_id: number){
      const channels: Channel[] = await this.channelRepository.find({where: {type: true}});
      for (let i = 0; i < (await channels).length; i++) {
        const relationnal = await this.getOwner(channels[i].id);
        const areFriends = await this.relationnalRepository.findOne({where : {user: relationnal.user_id, friend: user_id}});
        if (!areFriends && user_id != relationnal.user_id) {
          channels.splice(i, 1);
          i--;
        }
      }
      return (channels);
    }

    async checkPassword(channel_id: number, password: string) {
      const channel = await this.getChannelById(channel_id);
      if (channel && channel.password && (await bcrypt.compare(password, channel.password))) {
        return {message: "success"}
      }
      return {message: "failure"}
    }

    async getChannelByName(channel_name: string): Promise<Channel>{
        return await this.channelRepository.findOne({where : {channel_name: channel_name}});
    }

    //supprime un channel // a check lorsque que 1 membre delete le channel
    async deleteChannelById(invitation_id: number){
        this.channelRepository.delete(invitation_id);
    }

    //////////////////////////RELATIONNALCHANNEL////////////////////////////////////
    async createRelationnalChannel(channel_id: number, user_id: number): Promise<boolean>
    {
        const relationnal: RelationnalChannel = this.relationnalChannelRepository.create();
        relationnal.channel_id = channel_id;
        relationnal.user_id = user_id;
        relationnal.owner = true;
        relationnal.admin = false;
        await this.relationnalChannelRepository.insert(relationnal);
        return true;
    }


    async deleteRelationnalChannel(channel_id: number, user_id: number): Promise<boolean>
    {
        const relationnals = await this.relationnalChannelRepository.findOne({where: {channel_id: channel_id, user_id: user_id}})
        await this.relationnalChannelRepository.delete(relationnals);
        return true;
    }

      async getAllUserInChannel(channel_id: number) {
        const relations = await this.relationnalChannelRepository.find({where: {channel_id: channel_id}});
        return relations;
      }

      async getRelationnalChannelByUserId(user_id: number) {
        return await this.relationnalChannelRepository.find({where: {user_id: user_id}});
      }

      async muteUser(user_id: number, channel_id: number) {
        const muted = await this.muteListRepository.findOne({where: {user_id: user_id, channel_id: channel_id}});
        if (muted)
        {
          muted.state = 1;
          muted.created = new Date();
          await this.banListRepository.save(muted);
          return ;
        }
        const mute: MuteList = await this.muteListRepository.create();
        mute.user_id = user_id;
        mute.channel_id = channel_id;
        await this.muteListRepository.insert(mute);
      }

      async checkMuteUser(user_id: number, channel_id: number): Promise<boolean> {
        const mute = await this.muteListRepository.findOne({where: {user_id: user_id, channel_id: channel_id, state: 1}});
        if (!mute) {
          return true;
        }
        if (mute){
          const now = new Date();
          const dif = await Math.floor((now.getTime() - mute.created.getTime()) / 1000);
          if (dif >= 60) {
            await this.unmuteUser(user_id, channel_id);
            return true;
          }
        }
        return false;
      }

      async unmuteUser(user_id: number, channel_id: number) {
        const unmute: MuteList = await this.muteListRepository.findOne({where: {user_id: user_id, channel_id: channel_id}});
        if (unmute){
          unmute.state = 0;
          await this.muteListRepository.save(unmute);
        }
        return unmute;
      }

      async getMutebyUserAndChannelId(user_id: number, channel_id: number): Promise<MuteList> {
        const mute : MuteList = await this.muteListRepository.findOne({where: {user_id: user_id, channel_id: channel_id}});
        return mute;
      }

      async banUser(user_id: number, channel_id: number) {
        const check: BanList = await this.banListRepository.findOne({where: {user_id: user_id, channel_id: channel_id}});
        if (check) {
          check.state = 1;
          check.created = new Date();
          await this.banListRepository.save(check);
          return ;
        }
        const ban: BanList = await this.banListRepository.create();
        ban.user_id = user_id;
        ban.channel_id = channel_id;
        await this.banListRepository.save(ban);
      }

      async checkUnbanUser(user_id: number, channel_id: number): Promise<boolean> {
        const unban: BanList = await this.banListRepository.findOne({where: {user_id: user_id, channel_id: channel_id, state: 1}});
        if (!unban) {
          return true;
        }
        if (unban){
          const now = new Date();
          const dif = await Math.floor((now.getTime() - unban.created.getTime()) / 1000);
          if (dif >= 60) {
            await this.unbanUser(user_id, channel_id);
            return true;
          }
        }
        return false;
      }


      async unbanUser(user_id: number, channel_id: number) {
        const unban: BanList = await this.banListRepository.findOne({where: {user_id: user_id, channel_id: channel_id}});
        if (unban){
          unban.state = 0;
          await this.banListRepository.save(unban);
        }
      }

      async getBanByUserAndChannel(user_id: number, channel_id: number) {
        return await this.banListRepository.findOne({where: {user_id: user_id, channel_id: channel_id, state: 1}});
      }

      async getOwner(channel_id: number): Promise<RelationnalChannel>{
        return this.relationnalChannelRepository.findOne({where: {channel_id: channel_id, owner: true}});
      }

      async getAdmins(channel_id: number): Promise<RelationnalChannel[]>{
        return this.relationnalChannelRepository.find({where: {channel_id: channel_id, admin: true}});
      }

      async getBannedUsers(channel_id: number){
        const users = [];
        let i: number = 0;
        const banlist = await this.banListRepository.find({where: {channel_id: channel_id, state: 1}});
        while (banlist[i]) {
            users[i] = await this.userService.getUserById(banlist[i].user_id);
            i++;
        }
        return (users);
      }

      async getMutedUsers(channel_id: number){
        const users = [];
        let i: number = 0;
        const mutelist = await this.muteListRepository.find({where: {channel_id: channel_id}});
        while (mutelist[i]) {
            users[i] = await this.userService.getUserById(mutelist[i].user_id);
            i++;
        }
        return (users);
      }

      async promoteToAdmin(channel_id: number, user_id: number) {
          const check = await this.relationnalChannelRepository.findOne({where: {user_id: user_id, channel_id: channel_id}});
          if (check) {
            check.admin = true;
            await this.relationnalChannelRepository.save(check);
            return check;
          }
          const relationnal: RelationnalChannel = this.relationnalChannelRepository.create();
          relationnal.channel_id = channel_id;
          relationnal.user_id = user_id;
          relationnal.owner = false;
          relationnal.admin = true;
          await this.relationnalChannelRepository.insert(relationnal);
          return relationnal;
      }

      async demoteToUser(channel_id: number, user_id: number) {
        const check = await this.relationnalChannelRepository.findOne({where: {user_id: user_id, channel_id: channel_id}});
        if (check) {
          check.admin = false;
          await this.relationnalChannelRepository.save(check);
          return check;
        }
      }

      async resetPassword(id: number) {
        const channel = await this.channelRepository.findOne({where: {id: id}});
        if (channel) {
          channel.password = null;
          channel.type = false;
          await this.channelRepository.save(channel);
          return true;
        }
        return false;
      }

      async changePassword(id: number, password: string) {
        const channel = await this.channelRepository.findOne({where: {id: id}});
        if (channel) {
          const saltOrRounds = 10;
          const hashed_password = await bcrypt.hash(password, saltOrRounds);
          channel.password = hashed_password;
          channel.type = null;
          await this.channelRepository.save(channel);
          return true;
        }
        return false;
      }

      async switchToPrivate(id: number) {
        const channel = await this.channelRepository.findOne({where: {id: id}});
        if (channel) {
          channel.password = null;
          channel.type = true;
          await this.channelRepository.save(channel);
          return true;
        }
        return false;
      }

      async switchToPublic(id: number) {
        const channel = await this.channelRepository.findOne({where: {id: id}});
        if (channel) {
          channel.password = null;
          channel.type = false;
          await this.channelRepository.save(channel);
          return true;
        }
        return false;
      }

      async changeName(id: number, name: string) {
        const channel = await this.channelRepository.findOne({where: {id: id}});
        if (channel) {
          channel.channel_name = name;
          await this.channelRepository.save(channel);
          return true;
        }
        return false;
      }
}


