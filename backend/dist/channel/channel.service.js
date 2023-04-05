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
exports.ChannelService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const channel_entity_1 = require("./channel.entity");
const user_service_1 = require("../user/user.service");
const relationnalChannel_entity_1 = require("./relationnalChannel.entity");
const mutelist_entity_1 = require("./mutelist.entity");
const banlist_entity_1 = require("./banlist.entity");
const relationnal_entity_1 = require("../relationnal/relationnal.entity");
const bcrypt = require("bcrypt");
let ChannelService = class ChannelService {
    constructor(channelRepository, userService, relationnalChannelRepository, relationnalRepository, muteListRepository, banListRepository) {
        this.channelRepository = channelRepository;
        this.userService = userService;
        this.relationnalChannelRepository = relationnalChannelRepository;
        this.relationnalRepository = relationnalRepository;
        this.muteListRepository = muteListRepository;
        this.banListRepository = banListRepository;
    }
    async createChannel(channel_name, password, isPrivate) {
        const channel = await this.channelRepository.create();
        if (!channel_name) {
            return channel;
        }
        try {
            channel.channel_name = channel_name;
            if (password) {
                const saltOrRounds = 10;
                const hashed_password = await bcrypt.hash(password, saltOrRounds);
                channel.password = hashed_password;
                await this.channelRepository.save(channel);
            }
            else {
                channel.type = isPrivate;
                await this.channelRepository.save(channel);
            }
            return channel;
        }
        catch (error) {
            return channel;
        }
    }
    async getChannelById(channel_id) {
        return await this.channelRepository.findOneBy({ id: channel_id });
    }
    async getAllChannels() {
        return await this.channelRepository.find();
    }
    async getPublicChannels() {
        return await this.channelRepository.find({ where: { type: false } });
    }
    async getProtectedChannels() {
        return await this.channelRepository.find({ where: { password: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) } });
    }
    async getPrivateChannels(user_id) {
        const channels = await this.channelRepository.find({ where: { type: true } });
        for (let i = 0; i < (await channels).length; i++) {
            const relationnal = await this.getOwner(channels[i].id);
            const areFriends = await this.relationnalRepository.findOne({ where: { user: relationnal.user_id, friend: user_id } });
            if (!areFriends && user_id != relationnal.user_id) {
                channels.splice(i, 1);
                i--;
            }
        }
        return (channels);
    }
    async checkPassword(channel_id, password) {
        const channel = await this.getChannelById(channel_id);
        if (channel && channel.password && (await bcrypt.compare(password, channel.password))) {
            return { message: "success" };
        }
        return { message: "failure" };
    }
    async getChannelByName(channel_name) {
        return await this.channelRepository.findOne({ where: { channel_name: channel_name } });
    }
    async deleteChannelById(invitation_id) {
        this.channelRepository.delete(invitation_id);
    }
    async createRelationnalChannel(channel_id, user_id) {
        const relationnal = this.relationnalChannelRepository.create();
        relationnal.channel_id = channel_id;
        relationnal.user_id = user_id;
        relationnal.owner = true;
        relationnal.admin = false;
        await this.relationnalChannelRepository.insert(relationnal);
        return true;
    }
    async deleteRelationnalChannel(channel_id, user_id) {
        const relationnals = await this.relationnalChannelRepository.findOne({ where: { channel_id: channel_id, user_id: user_id } });
        await this.relationnalChannelRepository.delete(relationnals);
        return true;
    }
    async getAllUserInChannel(channel_id) {
        const relations = await this.relationnalChannelRepository.find({ where: { channel_id: channel_id } });
        return relations;
    }
    async getRelationnalChannelByUserId(user_id) {
        return await this.relationnalChannelRepository.find({ where: { user_id: user_id } });
    }
    async muteUser(user_id, channel_id) {
        const muted = await this.muteListRepository.findOne({ where: { user_id: user_id, channel_id: channel_id } });
        if (muted) {
            muted.state = 1;
            muted.created = new Date();
            await this.banListRepository.save(muted);
            return;
        }
        const mute = await this.muteListRepository.create();
        mute.user_id = user_id;
        mute.channel_id = channel_id;
        await this.muteListRepository.insert(mute);
    }
    async checkMuteUser(user_id, channel_id) {
        const mute = await this.muteListRepository.findOne({ where: { user_id: user_id, channel_id: channel_id, state: 1 } });
        if (!mute) {
            return true;
        }
        if (mute) {
            const now = new Date();
            const dif = await Math.floor((now.getTime() - mute.created.getTime()) / 1000);
            if (dif >= 60) {
                await this.unmuteUser(user_id, channel_id);
                return true;
            }
        }
        return false;
    }
    async unmuteUser(user_id, channel_id) {
        const unmute = await this.muteListRepository.findOne({ where: { user_id: user_id, channel_id: channel_id } });
        if (unmute) {
            unmute.state = 0;
            await this.muteListRepository.save(unmute);
        }
        return unmute;
    }
    async getMutebyUserAndChannelId(user_id, channel_id) {
        const mute = await this.muteListRepository.findOne({ where: { user_id: user_id, channel_id: channel_id } });
        return mute;
    }
    async banUser(user_id, channel_id) {
        const check = await this.banListRepository.findOne({ where: { user_id: user_id, channel_id: channel_id } });
        if (check) {
            check.state = 1;
            check.created = new Date();
            await this.banListRepository.save(check);
            return;
        }
        const ban = await this.banListRepository.create();
        ban.user_id = user_id;
        ban.channel_id = channel_id;
        await this.banListRepository.save(ban);
    }
    async checkUnbanUser(user_id, channel_id) {
        const unban = await this.banListRepository.findOne({ where: { user_id: user_id, channel_id: channel_id, state: 1 } });
        if (!unban) {
            return true;
        }
        if (unban) {
            const now = new Date();
            const dif = await Math.floor((now.getTime() - unban.created.getTime()) / 1000);
            if (dif >= 60) {
                await this.unbanUser(user_id, channel_id);
                return true;
            }
        }
        return false;
    }
    async unbanUser(user_id, channel_id) {
        const unban = await this.banListRepository.findOne({ where: { user_id: user_id, channel_id: channel_id } });
        if (unban) {
            unban.state = 0;
            await this.banListRepository.save(unban);
        }
    }
    async getBanByUserAndChannel(user_id, channel_id) {
        return await this.banListRepository.findOne({ where: { user_id: user_id, channel_id: channel_id, state: 1 } });
    }
    async getOwner(channel_id) {
        return this.relationnalChannelRepository.findOne({ where: { channel_id: channel_id, owner: true } });
    }
    async getAdmins(channel_id) {
        return this.relationnalChannelRepository.find({ where: { channel_id: channel_id, admin: true } });
    }
    async getBannedUsers(channel_id) {
        const users = [];
        let i = 0;
        const banlist = await this.banListRepository.find({ where: { channel_id: channel_id, state: 1 } });
        while (banlist[i]) {
            users[i] = await this.userService.getUserById(banlist[i].user_id);
            i++;
        }
        return (users);
    }
    async getMutedUsers(channel_id) {
        const users = [];
        let i = 0;
        const mutelist = await this.muteListRepository.find({ where: { channel_id: channel_id } });
        while (mutelist[i]) {
            users[i] = await this.userService.getUserById(mutelist[i].user_id);
            i++;
        }
        return (users);
    }
    async promoteToAdmin(channel_id, user_id) {
        const check = await this.relationnalChannelRepository.findOne({ where: { user_id: user_id, channel_id: channel_id } });
        if (check) {
            check.admin = true;
            await this.relationnalChannelRepository.save(check);
            return check;
        }
        const relationnal = this.relationnalChannelRepository.create();
        relationnal.channel_id = channel_id;
        relationnal.user_id = user_id;
        relationnal.owner = false;
        relationnal.admin = true;
        await this.relationnalChannelRepository.insert(relationnal);
        return relationnal;
    }
    async demoteToUser(channel_id, user_id) {
        const check = await this.relationnalChannelRepository.findOne({ where: { user_id: user_id, channel_id: channel_id } });
        if (check) {
            check.admin = false;
            await this.relationnalChannelRepository.save(check);
            return check;
        }
    }
    async resetPassword(id) {
        const channel = await this.channelRepository.findOne({ where: { id: id } });
        if (channel) {
            channel.password = null;
            channel.type = false;
            await this.channelRepository.save(channel);
            return true;
        }
        return false;
    }
    async changePassword(id, password) {
        const channel = await this.channelRepository.findOne({ where: { id: id } });
        if (channel) {
            const saltOrRounds = 10;
            const hashed_password = await bcrypt.hash(password, saltOrRounds);
            channel.password = hashed_password;
            channel.type = null;
            await this.channelRepository.save(channel);
            return true;
        }
        return false;
    }
    async switchToPrivate(id) {
        const channel = await this.channelRepository.findOne({ where: { id: id } });
        if (channel) {
            channel.password = null;
            channel.type = true;
            await this.channelRepository.save(channel);
            return true;
        }
        return false;
    }
    async switchToPublic(id) {
        const channel = await this.channelRepository.findOne({ where: { id: id } });
        if (channel) {
            channel.password = null;
            channel.type = false;
            await this.channelRepository.save(channel);
            return true;
        }
        return false;
    }
    async changeName(id, name) {
        const channel = await this.channelRepository.findOne({ where: { id: id } });
        if (channel) {
            channel.channel_name = name;
            await this.channelRepository.save(channel);
            return true;
        }
        return false;
    }
};
ChannelService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(channel_entity_1.Channel)),
    __param(2, (0, typeorm_1.InjectRepository)(relationnalChannel_entity_1.RelationnalChannel)),
    __param(3, (0, typeorm_1.InjectRepository)(relationnal_entity_1.Relationnal)),
    __param(4, (0, typeorm_1.InjectRepository)(mutelist_entity_1.MuteList)),
    __param(5, (0, typeorm_1.InjectRepository)(banlist_entity_1.BanList)),
    __metadata("design:paramtypes", [typeorm_2.Repository, user_service_1.UserService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ChannelService);
exports.ChannelService = ChannelService;
//# sourceMappingURL=channel.service.js.map