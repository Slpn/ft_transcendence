import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelService } from 'src/channel/channel.service';
import { SocketService } from 'src/sockets/socket.service';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { Message } from './message.entity'
import { PrivateMessage } from './privatemessage.entity';


@Injectable()
export class MessageService{
    constructor(
        @InjectRepository(Message) private messageRepository: Repository<Message>,
        @InjectRepository(PrivateMessage) private privateMessageRepository: Repository<PrivateMessage>,
        private readonly userService: UserService,
        private readonly channelService: ChannelService,
      ) {}

    //cree une relation avec l'envoyer et le receveur 
    async createMessage(sender: number, channel: number, content: string): Promise<boolean>
    {
        const msg = this.messageRepository.create()
        msg.sender = sender;
        ///si l'utilisateur existe dans la base 
        msg.channel = channel;
        if (!msg.channel)
          msg.channel = 0;
        msg.contents = content;
        if (!content)
          return false;
        await this.messageRepository.insert(msg);
        return true;
    }

    async createPrivateMessage(sender: number, receiver: number, content: string): Promise<boolean>
    {
        const msg = this.privateMessageRepository.create()
        msg.sender = sender;
        msg.receiver = receiver;
        ///si l'utilisateur existe dans la base 
        msg.content = content;
        if (!content)
          return false;
        await this.privateMessageRepository.insert(msg);
        return true;
    }
      
    async getMessageById(msg_id: number): Promise<Message> {
        return await this.messageRepository.findOne({where: {id: msg_id}});

      }

      async getAllMessageByChannelId(channel: number)
      {
        const msg = await this.messageRepository.find({where: {channel: channel}});
        return msg;
      }

      async getPrivateMessage(user1: number, user2: number){
        const message = await this.privateMessageRepository.find({
          where: [ {sender: user1, receiver: user2}, {sender: user2, receiver: user1},
          ]
        });
        return message;
      }
}
