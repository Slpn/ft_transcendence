import { Module } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './channel.entity';
import { MuteList } from './mutelist.entity';
import { BanList } from './banlist.entity';
import { UserModule } from 'src/user/user.module';
import { RelationnalChannel } from './relationnalChannel.entity';
import { Relationnal } from 'src/relationnal/relationnal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Channel, RelationnalChannel, MuteList, BanList, Relationnal]), UserModule],
  controllers: [ChannelController],
  providers: [ChannelService],
  exports: [ChannelService],
})
export class ChannelModule {}
