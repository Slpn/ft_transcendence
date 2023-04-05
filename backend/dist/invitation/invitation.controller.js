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
exports.InvitationController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../user/user.service");
const invitation_service_1 = require("./invitation.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let InvitationController = class InvitationController {
    constructor(invitationService, userService) {
        this.invitationService = invitationService;
        this.userService = userService;
    }
    async inviteFriend(request, res) {
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        const invitation = await this.invitationService.getBySenderAndInvited(decodedToken.sub, request.body.id);
        const invitation2 = await this.invitationService.getBySenderAndInvited(request.body.id, decodedToken.sub);
        if (!invitation && !invitation2) {
            await this.invitationService.createInvitation(decodedToken.sub, request.body.id);
        }
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.json({ message: "success" });
    }
    async acceptInvite(request, res) {
        const invitation = await this.invitationService.acceptInvitation(request.body.invitation_id);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        if (invitation) {
            return res.json({ invitation: invitation, accepted: true });
        }
        return res.json({ invitation: invitation, accepted: false });
    }
    async declineInvite(request, res) {
        const invitation = await this.invitationService.acceptInvitation(request.body.invitation_id);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(invitation);
    }
    async listsInvite(request, res) {
        let user_list = [];
        const decodedToken = await this.userService.decodeJwtToken(request.cookies.Auth);
        const invitationList = await this.invitationService.getListInvitationById(decodedToken.sub);
        let i = 0;
        while (invitationList[i]) {
            user_list[i] = await this.userService.getUserById(invitationList[i].sender);
            i++;
        }
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json({ invitationsList: invitationList, users: user_list });
    }
};
__decorate([
    (0, common_1.Post)('/inviteFriend'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "inviteFriend", null);
__decorate([
    (0, common_1.Post)('acceptInvitation'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "acceptInvite", null);
__decorate([
    (0, common_1.Post)('declineInvitation'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "declineInvite", null);
__decorate([
    (0, common_1.Get)('/listsInvite'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "listsInvite", null);
InvitationController = __decorate([
    (0, common_1.Controller)('invitation'),
    __metadata("design:paramtypes", [invitation_service_1.InvitationService,
        user_service_1.UserService])
], InvitationController);
exports.InvitationController = InvitationController;
//# sourceMappingURL=invitation.controller.js.map