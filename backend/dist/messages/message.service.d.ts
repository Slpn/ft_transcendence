import { ChannelService } from 'src/channel/channel.service';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { PrivateMessage } from './privatemessage.entity';
export declare class MessageService {
    private messageRepository;
    private privateMessageRepository;
    private readonly userService;
    private readonly channelService;
    constructor(messageRepository: Repository<Message>, privateMessageRepository: Repository<PrivateMessage>, userService: UserService, channelService: ChannelService);
    createMessage(sender: number, channel: number, content: string): Promise<boolean>;
    createPrivateMessage(sender: number, receiver: number, content: string): Promise<boolean>;
    getMessageById(msg_id: number): Promise<Message>;
    getAllMessageByChannelId(channel: number): Promise<Message[]>;
    getPrivateMessage(user1: number, user2: number): Promise<PrivateMessage[]>;
}
