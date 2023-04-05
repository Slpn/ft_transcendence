"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelModule = void 0;
const common_1 = require("@nestjs/common");
const channel_controller_1 = require("./channel.controller");
const channel_service_1 = require("./channel.service");
const typeorm_1 = require("@nestjs/typeorm");
const channel_entity_1 = require("./channel.entity");
const mutelist_entity_1 = require("./mutelist.entity");
const banlist_entity_1 = require("./banlist.entity");
const user_module_1 = require("../user/user.module");
const relationnalChannel_entity_1 = require("./relationnalChannel.entity");
const relationnal_entity_1 = require("../relationnal/relationnal.entity");
let ChannelModule = class ChannelModule {
};
ChannelModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([channel_entity_1.Channel, relationnalChannel_entity_1.RelationnalChannel, mutelist_entity_1.MuteList, banlist_entity_1.BanList, relationnal_entity_1.Relationnal]), user_module_1.UserModule],
        controllers: [channel_controller_1.ChannelController],
        providers: [channel_service_1.ChannelService],
        exports: [channel_service_1.ChannelService],
    })
], ChannelModule);
exports.ChannelModule = ChannelModule;
//# sourceMappingURL=channel.module.js.map