"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const user_service_1 = require("./user/user.service");
const typeorm_1 = require("@nestjs/typeorm");
const user_controller_1 = require("./user/user.controller");
const user_entity_1 = require("./user/user.entity");
const user_module_1 = require("./user/user.module");
const jwt_1 = require("@nestjs/jwt");
const auth_module_1 = require("./auth/auth.module");
const invitation_module_1 = require("./invitation/invitation.module");
const invitation_controller_1 = require("./invitation/invitation.controller");
const invitation_service_1 = require("./invitation/invitation.service");
const invitation_entity_1 = require("./invitation/invitation.entity");
const relationnal_entity_1 = require("./relationnal/relationnal.entity");
const channel_entity_1 = require("./channel/channel.entity");
const relationnal_controller_1 = require("./relationnal/relationnal.controller");
const relationnal_service_1 = require("./relationnal/relationnal.service");
const relationnal_module_1 = require("./relationnal/relationnal.module");
const config_1 = require("@nestjs/config");
const dotenv = require("dotenv");
const channel_module_1 = require("./channel/channel.module");
const channel_controller_1 = require("./channel/channel.controller");
const channel_service_1 = require("./channel/channel.service");
const relationnalChannel_entity_1 = require("./channel/relationnalChannel.entity");
const message_controller_1 = require("./messages/message.controller");
const message_service_1 = require("./messages/message.service");
const message_entity_1 = require("./messages/message.entity");
const socket_module_1 = require("./sockets/socket.module");
const socket_service_1 = require("./sockets/socket.service");
const privatemessage_entity_1 = require("./messages/privatemessage.entity");
const banlist_entity_1 = require("./user/banlist.entity");
const mutelist_entity_1 = require("./channel/mutelist.entity");
const banlist_entity_2 = require("./channel/banlist.entity");
const global_provider_1 = require("./sockets/global.provider");
const game_module_1 = require("./game/game.module");
const game_controller_1 = require("./game/game.controller");
const game_entity_1 = require("./game/game.entity");
const game_service_1 = require("./game/game.service");
dotenv.config();
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT),
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                url: 'postgres://adminUser:adminPwd@postgres:5432/ft_transcendense',
                entities: ["dist/**/*.entity{.ts,.js}"],
                synchronize: true,
                autoLoadEntities: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, invitation_entity_1.Invitation, relationnal_entity_1.Relationnal, channel_entity_1.Channel, relationnalChannel_entity_1.RelationnalChannel, message_entity_1.Message, privatemessage_entity_1.PrivateMessage, banlist_entity_1.Blocklist, mutelist_entity_1.MuteList, banlist_entity_2.BanList, game_entity_1.Game]),
            user_module_1.UserModule,
            jwt_1.JwtModule.register({
                secret: 'ft_transcendense',
                signOptions: { expiresIn: '1d' },
            }),
            auth_module_1.AuthModule,
            invitation_module_1.InvitationModule,
            relationnal_module_1.RelationnalModule,
            channel_module_1.ChannelModule,
            socket_module_1.SocketModule,
            game_module_1.GameModule,
            config_1.ConfigModule.forRoot({
                envFilePath: '../.env'
            }),
        ],
        controllers: [app_controller_1.AppController, user_controller_1.UserController, invitation_controller_1.InvitationController, relationnal_controller_1.RelationnalController, channel_controller_1.ChannelController, message_controller_1.MessageController, game_controller_1.GameController],
        providers: [app_service_1.AppService, user_service_1.UserService, invitation_service_1.InvitationService, relationnal_service_1.RelationnalService, channel_service_1.ChannelService, message_service_1.MessageService, socket_service_1.SocketService, global_provider_1.GlobalProvider, game_service_1.GameService],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map