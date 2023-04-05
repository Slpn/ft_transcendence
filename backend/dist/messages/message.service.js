"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const channel_service_1 = require("../channel/channel.service");
const user_service_1 = require("../user/user.service");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("./message.entity");
const privatemessage_entity_1 = require("./privatemessage.entity");
let MessageService = class MessageService {
    constructor(messageRepository, privateMessageRepository, userService, channelService) {
        this.messageRepository = messageRepository;
        this.privateMessageRepository = privateMessageRepository;
        this.userService = userService;
        this.channelService = channelService;
    }
    async createMessage(sender, channel, content) {
        const msg = this.messageRepository.create();
        msg.sender = sender;
        msg.channel = channel;
        if (!msg.channel)
            msg.channel = 0;
        msg.contents = content;
        if (!content)
            return false;
        await this.messageRepository.insert(msg);
        return true;
    }
    async createPrivateMessage(sender, receiver, content) {
        const msg = this.privateMessageRepository.create();
        msg.sender = sender;
        msg.receiver = receiver;
        msg.content = content;
        if (!content)
            return false;
        await this.privateMessageRepository.insert(msg);
        return true;
    }
    async getMessageById(msg_id) {
        return await this.messageRepository.findOne({ where: { id: msg_id } });
    }
    async getAllMessageByChannelId(channel) {
        const msg = await this.messageRepository.find({ where: { channel: channel } });
        return msg;
    }
    async getPrivateMessage(user1, user2) {
        const message = await this.privateMessageRepository.find({
            where: [{ sender: user1, receiver: user2 }, { sender: user2, receiver: user1 },
            ]
        });
        return message;
    }
};
MessageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(1, (0, typeorm_1.InjectRepository)(privatemessage_entity_1.PrivateMessage)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        user_service_1.UserService,
        channel_service_1.ChannelService])
], MessageService);
exports.MessageService = MessageService;
//# sourceMappingURL=message.service.js.map