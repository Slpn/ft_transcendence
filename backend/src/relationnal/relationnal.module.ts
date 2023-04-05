
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationModule } from 'src/invitation/invitation.module';
import { UserModule } from 'src/user/user.module';

import { RelationnalService } from '../relationnal/relationnal.service';
import { RelationnalController } from './relationnal.controller';
import { Relationnal } from './relationnal.entity';

@Module({
imports: [
    TypeOrmModule.forFeature([Relationnal]),
    InvitationModule, UserModule],
  controllers: [RelationnalController],
  providers: [RelationnalService],
  exports: [RelationnalService]
})
export class RelationnalModule {}
