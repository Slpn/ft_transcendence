import { MessageService } from './message.service';
import { UserService } from 'src/user/user.service';
import { ChannelService } from '../channel/channel.service';
export declare class MessageController {
    private messageService;
    private userService;
    private channelService;
    constructor(messageService: MessageService, userService: UserService, channelService: ChannelService);
    createMessage(request: any, res: any): Promise<any>;
    sendMessage(request: any, res: any): Promise<any>;
    getAllMessageByChannelId(channelId: any, req: any, res: any): Promise<any>;
    getPrivateMessage(user1: any, user2: any, req: any, res: any): Promise<any>;
}
