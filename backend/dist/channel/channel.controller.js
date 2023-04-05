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
exports.ChannelController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../user/user.service");
const channel_service_1 = require("./channel.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ChannelController = class ChannelController {
    constructor(channelService, userService) {
        this.channelService = channelService;
        this.userService = userService;
    }
    async createChannel(request, res) {
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        const chan = await this.channelService.createChannel(request.body.nameChannel, request.body.passwordChannel, request.body.isPrivate);
        await this.channelService.createRelationnalChannel(chan.id, decodedToken.sub);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json({ message: "success" });
    }
    async getChannel(request, res, channelId) {
        const channel = await this.channelService.getChannelById(channelId);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(channel);
    }
    async getChannels(request, res) {
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        const channel = await this.channelService.getAllChannels();
        let i = 0;
        while (channel[i]) {
            if (await this.channelService.getBanByUserAndChannel(decodedToken.sub, channel[i].id)) {
                await channel.splice(i, 1);
            }
            i++;
        }
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(channel);
    }
    async getPublicChannels(res) {
        const channel = await this.channelService.getPublicChannels();
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(channel);
    }
    async getPrivateChannels(id, request, res) {
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        const channel = await this.channelService.getPrivateChannels(decodedToken.sub);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(channel);
    }
    async getProtectedChannels(request, res) {
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        const channel = await this.channelService.getProtectedChannels();
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(channel);
    }
    async getChannelOwner(res, channel_id) {
        const owner = await this.channelService.getOwner(channel_id);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(owner);
    }
    async getChannelAdmins(res, channel_id) {
        const admins = await this.channelService.getAdmins(channel_id);
        const adminsUsers = [];
        let i = 0;
        while (admins[i]) {
            adminsUsers[i] = await this.userService.getUserById(admins[i].user_id);
            i++;
        }
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(adminsUsers);
    }
    async getBannedUsers(res, channel_id) {
        const bannedUsers = await this.channelService.getBannedUsers(channel_id);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(bannedUsers);
    }
    async changeName(request, res, channel_id) {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json(await this.channelService.changeName(request.body.channel_id, request.body.name));
    }
    async getMutedUsers(res, channel_id) {
        const mutedUsers = await this.channelService.getMutedUsers(channel_id);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(mutedUsers);
    }
    async listsUserInChannel(channelId, request, res) {
        let userlist = [];
        const channel = await this.channelService.getChannelById(channelId);
        const UserList = await this.channelService.getAllUserInChannel(channel.id);
        let i = 0;
        while (UserList[i]) {
            userlist[i] = await this.userService.getUserById(UserList[i].user_id);
            i++;
        }
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json({ userlist });
    }
    async checkPassword(request, res) {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(await this.channelService.checkPassword(request.body.channel_id, request.body.password));
    }
    async promoteToAdmin(request, res) {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(await this.channelService.promoteToAdmin(request.body.channel_id, request.body.user_id));
    }
    async demoteToUser(request, res) {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(await this.channelService.demoteToUser(request.body.channel_id, request.body.user_id));
    }
    async getBanByUserAndChannel(id, request, res) {
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(await this.channelService.getBanByUserAndChannel(decodedToken.sub, id));
    }
    async muteUser(request, res) {
        const mute = await this.channelService.muteUser(request.body.user_id, request.body.channel_id);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json(mute);
    }
    async unmuteUser(request, res) {
        const unmute = await this.channelService.unmuteUser(request.body.user_id, request.body.channel_id);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json(unmute);
    }
    async banUser(request, res) {
        const ban = await this.channelService.banUser(request.body.user_id, request.body.channel_id);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json(ban);
    }
    async checkUnbanUser(id, request, res) {
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        const check = await this.channelService.checkUnbanUser(decodedToken.sub, id);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json({ message: check });
    }
    async unbanUser(request, res) {
        const unban = await this.channelService.unbanUser(request.body.user_id, request.body.channel_id);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json(unban);
    }
    async resetPassword(request, res) {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json(await this.channelService.resetPassword(request.body.channel_id));
    }
    async changePassword(request, res) {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json(await this.channelService.changePassword(request.body.channel_id, request.body.password));
    }
    async switchToPrivate(request, res) {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json(await this.channelService.switchToPrivate(request.body.channel_id));
    }
    async switchToPublic(request, res) {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json(await this.channelService.switchToPublic(request.body.channel_id));
    }
};
__decorate([
    (0, common_1.Post)('/createChannel'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "createChannel", null);
__decorate([
    (0, common_1.Get)('/getChannel/:channelId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __param(2, (0, common_1.Param)("channelId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "getChannel", null);
__decorate([
    (0, common_1.Get)('/getChannels'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "getChannels", null);
__decorate([
    (0, common_1.Get)('/getPublicChannels'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "getPublicChannels", null);
__decorate([
    (0, common_1.Get)('/getPrivateChannels'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "getPrivateChannels", null);
__decorate([
    (0, common_1.Get)('/getProtectedChannels'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "getProtectedChannels", null);
__decorate([
    (0, common_1.Get)('/getChannelOwner/:channel_id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Response)()),
    __param(1, (0, common_1.Param)("channel_id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "getChannelOwner", null);
__decorate([
    (0, common_1.Get)('/getChannelAdmins/:channel_id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Response)()),
    __param(1, (0, common_1.Param)("channel_id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "getChannelAdmins", null);
__decorate([
    (0, common_1.Get)('/getBannedUsers/:channel_id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Response)()),
    __param(1, (0, common_1.Param)("channel_id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "getBannedUsers", null);
__decorate([
    (0, common_1.Post)('/changeName'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __param(2, (0, common_1.Param)("channel_id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "changeName", null);
__decorate([
    (0, common_1.Get)('/getMutedUsers/:channel_id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Response)()),
    __param(1, (0, common_1.Param)("channel_id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "getMutedUsers", null);
__decorate([
    (0, common_1.Get)('/listsUserInChannel/:channelId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("channelId")),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "listsUserInChannel", null);
__decorate([
    (0, common_1.Post)("/checkPassword"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "checkPassword", null);
__decorate([
    (0, common_1.Post)("/promoteToAdmin"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "promoteToAdmin", null);
__decorate([
    (0, common_1.Post)("/demoteToUser"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "demoteToUser", null);
__decorate([
    (0, common_1.Get)("/getBanByUserAndChannel/:id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "getBanByUserAndChannel", null);
__decorate([
    (0, common_1.Post)('/muteUser'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "muteUser", null);
__decorate([
    (0, common_1.Post)('/unmuteUser'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "unmuteUser", null);
__decorate([
    (0, common_1.Post)('/banUser'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "banUser", null);
__decorate([
    (0, common_1.Get)('/checkUnbanUser/:channel_id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("channel_id")),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "checkUnbanUser", null);
__decorate([
    (0, common_1.Post)('/unbanUser'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "unbanUser", null);
__decorate([
    (0, common_1.Post)('/resetPassword'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('/changePassword'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('/switchToPrivate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "switchToPrivate", null);
__decorate([
    (0, common_1.Post)('/switchToPublic'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "switchToPublic", null);
ChannelController = __decorate([
    (0, common_1.Controller)('channel'),
    __metadata("design:paramtypes", [channel_service_1.ChannelService,
        user_service_1.UserService])
], ChannelController);
exports.ChannelController = ChannelController;
//# sourceMappingURL=channel.controller.js.map