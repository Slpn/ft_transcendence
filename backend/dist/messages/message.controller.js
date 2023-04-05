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
exports.MessageController = void 0;
const common_1 = require("@nestjs/common");
const message_service_1 = require("./message.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const user_service_1 = require("../user/user.service");
const channel_service_1 = require("../channel/channel.service");
let MessageController = class MessageController {
    constructor(messageService, userService, channelService) {
        this.messageService = messageService;
        this.userService = userService;
        this.channelService = channelService;
    }
    async createMessage(request, res) {
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        const ret = await this.messageService.createMessage(decodedToken.sub, request.body.channel_id, request.body.message);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        if (ret) {
            return res.json(true);
        }
        return res.json(false);
    }
    async sendMessage(request, res) {
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        const msg = await this.messageService.createMessage(decodedToken.sub, request.body.channel_id, request.body.message);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json({ message: request.body.message, channel_id: request.body.channel_id });
    }
    async getAllMessageByChannelId(channelId, req, res) {
        let userslist = [];
        const messageList = await this.messageService.getAllMessageByChannelId(channelId);
        let i = 0;
        while (messageList[i]) {
            userslist[i] = await this.userService.getUserById(messageList[i].sender);
            i++;
        }
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json({ messages: messageList, userslist: userslist });
    }
    async getPrivateMessage(user1, user2, req, res) {
        const privateMessage = await this.messageService.getPrivateMessage(user1, user2);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(privateMessage);
    }
};
__decorate([
    (0, common_1.Post)('/createMessage'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "createMessage", null);
__decorate([
    (0, common_1.Post)('/sendMessage'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)('/getAllMessageByChannelId/:channelId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("channelId")),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "getAllMessageByChannelId", null);
__decorate([
    (0, common_1.Get)('getPrivateMessage/:user1/:user2'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("user1")),
    __param(1, (0, common_1.Param)("user2")),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "getPrivateMessage", null);
MessageController = __decorate([
    (0, common_1.Controller)('Message'),
    __metadata("design:paramtypes", [message_service_1.MessageService,
        user_service_1.UserService,
        channel_service_1.ChannelService])
], MessageController);
exports.MessageController = MessageController;
//# sourceMappingURL=message.controller.js.map