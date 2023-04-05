import { Module} from "@nestjs/common"
import { SocketEvents } from "./socketEvent"
import { SocketService } from './socket.service'
import {UserModule} from "../user/user.module"
import { MessageService } from "src/messages/message.service"
import { ChannelService } from "src/channel/channel.service"
import { MessageModule } from "src/messages/message.module"
import { ChannelModule } from "src/channel/channel.module"
import { GlobalProvider } from "./global.provider"
import { GameService } from "src/game/game.service"
import { GameModule } from "src/game/game.module"

@Module({
    imports: [UserModule, MessageModule, ChannelModule, GameModule],
    providers: [SocketEvents, SocketService, GlobalProvider],
    exports: [SocketEvents],
})
export class SocketModule {}
