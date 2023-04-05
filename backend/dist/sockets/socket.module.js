"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketModule = void 0;
const common_1 = require("@nestjs/common");
const socketEvent_1 = require("./socketEvent");
const socket_service_1 = require("./socket.service");
const user_module_1 = require("../user/user.module");
const message_module_1 = require("../messages/message.module");
const channel_module_1 = require("../channel/channel.module");
const global_provider_1 = require("./global.provider");
const game_module_1 = require("../game/game.module");
let SocketModule = class SocketModule {
};
SocketModule = __decorate([
    (0, common_1.Module)({
        imports: [user_module_1.UserModule, message_module_1.MessageModule, channel_module_1.ChannelModule, game_module_1.GameModule],
        providers: [socketEvent_1.SocketEvents, socket_service_1.SocketService, global_provider_1.GlobalProvider],
        exports: [socketEvent_1.SocketEvents],
    })
], SocketModule);
exports.SocketModule = SocketModule;
//# sourceMappingURL=socket.module.js.map