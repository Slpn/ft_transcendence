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
exports.RelationnalController = void 0;
const common_1 = require("@nestjs/common");
const relationnal_service_1 = require("./relationnal.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const user_service_1 = require("../user/user.service");
let RelationnalController = class RelationnalController {
    constructor(relationnalService, userService) {
        this.relationnalService = relationnalService;
        this.userService = userService;
    }
    async createFriendship(request, res) {
        const relationnal = await this.relationnalService.getRelationnalBySenderAndInvited(request.body.id1, request.body.id2);
        const relationnal2 = await this.relationnalService.getRelationnalBySenderAndInvited(request.body.id2, request.body.id1);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        if (relationnal[0] || relationnal2[0]) {
            return res.json({ accepted: false });
        }
        await this.relationnalService.createRelationnal(request.body.id1, request.body.id2);
        await this.relationnalService.createRelationnal(request.body.id2, request.body.id1);
        return res.json({ accepted: true });
    }
    async deleteFriendship(request, res) {
        const decodedToken = this.userService.decodeJwtToken(request.cookies.Auth);
        await this.relationnalService.deleteRelationnal(request.body.id, decodedToken.sub);
        await this.relationnalService.deleteRelationnal(decodedToken.sub, request.body.id);
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json({ deleted: true });
    }
    async getFriends(req, res) {
        let friends_list = [];
        const decodedToken = await this.userService.decodeJwtToken(req.cookies.Auth);
        const relations = await this.relationnalService.getFriends(decodedToken.sub);
        let i = 0;
        while (i < relations.length) {
            friends_list[i] = await this.userService.getUserById(relations[i].friend);
            i++;
        }
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        return res.json(friends_list);
    }
};
__decorate([
    (0, common_1.Post)('/createFriendship'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RelationnalController.prototype, "createFriendship", null);
__decorate([
    (0, common_1.Post)('/deleteFriendship'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RelationnalController.prototype, "deleteFriendship", null);
__decorate([
    (0, common_1.Get)('getFriends'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RelationnalController.prototype, "getFriends", null);
RelationnalController = __decorate([
    (0, common_1.Controller)('relationnal'),
    __metadata("design:paramtypes", [relationnal_service_1.RelationnalService,
        user_service_1.UserService])
], RelationnalController);
exports.RelationnalController = RelationnalController;
//# sourceMappingURL=relationnal.controller.js.map