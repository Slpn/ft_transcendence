
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { MessageController } from './message.controller';
import { Message } from './message.entity';
import { MessageService } from './message.service';
import { SocketEvents } from '../sockets/socketEvent';
import { ChannelModule } from 'src/channel/channel.module';
import { SocketModule } from 'src/sockets/socket.module';
import { ChannelService } from 'src/channel/channel.service';
import { SocketService } from 'src/sockets/socket.service';
import { PrivateMessage } from './privatemessage.entity';

@Module({
imports: [
    TypeOrmModule.forFeature([Message, PrivateMessage]), UserModule, ChannelModule],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService]
})
export class MessageModule {}
