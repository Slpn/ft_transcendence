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
exports.InvitationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const invitation_entity_1 = require("./invitation.entity");
let InvitationService = class InvitationService {
    constructor(invitationRepository) {
        this.invitationRepository = invitationRepository;
    }
    async createInvitation(senderId, invitedId) {
        try {
            const invitation = await this.invitationRepository.create();
            invitation.sender = senderId;
            invitation.invited = invitedId;
            invitation.accepted = 0;
            await this.invitationRepository.save(invitation);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async getById(invitation_id) {
        return this.invitationRepository.findOneBy({ id: invitation_id });
    }
    async getBySenderAndInvited(sender, invited) {
        return this.invitationRepository.findOneBy({ sender: sender, invited: invited, accepted: 0 });
    }
    async deleteById(invitation_id) {
        this.invitationRepository.delete(invitation_id);
    }
    async getListInvitationById(id) {
        return this.invitationRepository.find({ where: [{ invited: id, accepted: 0 }] });
    }
    async acceptInvitation(id) {
        const invitation = await this.getById(id);
        invitation.accepted = 1;
        return this.invitationRepository.save(invitation);
    }
    async declineInvitation(id) {
        const invitation = await this.getById(id);
        return this.invitationRepository.delete(invitation);
    }
};
InvitationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invitation_entity_1.Invitation)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], InvitationService);
exports.InvitationService = InvitationService;
//# sourceMappingURL=invitation.service.js.map