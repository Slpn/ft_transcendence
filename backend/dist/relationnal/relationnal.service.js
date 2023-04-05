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
exports.RelationnalService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const invitation_service_1 = require("../invitation/invitation.service");
const user_service_1 = require("../user/user.service");
const typeorm_2 = require("typeorm");
const relationnal_entity_1 = require("./relationnal.entity");
let RelationnalService = class RelationnalService {
    constructor(relationnalRepository, invitationService, userService) {
        this.relationnalRepository = relationnalRepository;
        this.invitationService = invitationService;
        this.userService = userService;
    }
    async createRelationnal(user, friend) {
        const relationnal = this.relationnalRepository.create();
        relationnal.user = user;
        relationnal.friend = friend;
        await this.relationnalRepository.insert(relationnal);
        return true;
    }
    async deleteRelationnal(user, friend) {
        const relationnals = await this.relationnalRepository.findOne({ where: { user: user, friend: friend } });
        if (relationnals) {
            await this.relationnalRepository.delete(relationnals);
            return true;
        }
        return false;
    }
    async addFriend(user, friend) {
        if (!user || !friend)
            return false;
        await this.createRelationnal(user, friend);
        await this.createRelationnal(friend, user);
        return true;
    }
    async updateInvitation(invitionId, reply) {
        const invitation = await this.invitationService.getById(invitionId);
        if (!invitation) {
            return false;
        }
        if (reply == true) {
            await this.addFriend(invitation.invited, invitation.sender);
        }
        await this.invitationService.deleteById(invitionId);
        return true;
    }
    async getFriends(user_id) {
        const relations = await this.relationnalRepository.find({ where: { user: user_id } });
        return relations;
    }
    async getRelationnalBySenderAndInvited(sender, invited) {
        const relations = await this.relationnalRepository.find({ where: { user: sender, friend: invited } });
        return relations;
    }
};
RelationnalService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(relationnal_entity_1.Relationnal)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        invitation_service_1.InvitationService,
        user_service_1.UserService])
], RelationnalService);
exports.RelationnalService = RelationnalService;
//# sourceMappingURL=relationnal.service.js.map