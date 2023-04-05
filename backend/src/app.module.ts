import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserService } from './user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user/user.controller';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { InvitationModule } from './invitation/invitation.module';
import { InvitationController } from './invitation/invitation.controller';
import { InvitationService } from './invitation/invitation.service';
import { Invitation } from './invitation/invitation.entity';
import { Relationnal } from './relationnal/relationnal.entity';
import { Channel } from './channel/channel.entity';
import { RelationnalController } from './relationnal/relationnal.controller';
import { RelationnalService } from './relationnal/relationnal.service';
import { RelationnalModule } from './relationnal/relationnal.module';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { ChannelModule } from './channel/channel.module';
import { ChannelController } from './channel/channel.controller';
import { ChannelService } from './channel/channel.service';
import { RelationnalChannel } from './channel/relationnalChannel.entity';
import { MessageController } from './messages/message.controller';
import { MessageService } from './messages/message.service';
import { Message } from './messages/message.entity';
import { SocketModule } from './sockets/socket.module';
import { SocketService } from './sockets/socket.service';
import { PrivateMessage } from './messages/privatemessage.entity';
import { Blocklist } from './user/banlist.entity';
import { MuteList } from './channel/mutelist.entity';
import { BanList } from './channel/banlist.entity';
import { GlobalProvider } from './sockets/global.provider';
import { GameModule } from './game/game.module';
import { GameController } from './game/game.controller';
import { Game } from './game/game.entity';
import { GameService } from './game/game.service';
dotenv.config();
// import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
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
    TypeOrmModule.forFeature([User, Invitation, Relationnal, Channel, RelationnalChannel, Message, PrivateMessage, Blocklist, MuteList, BanList, Game]),
    UserModule,
    JwtModule.register({
      secret: 'ft_transcendense',
      signOptions: { expiresIn: '1d' },
    }),
    AuthModule,
    InvitationModule,
    RelationnalModule,
    ChannelModule,
    SocketModule,
    GameModule,
    ConfigModule.forRoot({
		envFilePath:'../.env'
	}),
  ],
  controllers: [AppController, UserController, InvitationController, RelationnalController, ChannelController, MessageController, GameController],
  providers: [AppService, UserService, InvitationService, RelationnalService, ChannelService, MessageService, SocketService, GlobalProvider, GameService],
})
export class AppModule {}
