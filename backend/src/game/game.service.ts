import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like} from 'typeorm';
import { Game } from './game.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';


@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game) private gameRepository: Repository<Game>,
    private jwtService: JwtService,
  ) {}

  async getGameRepo() : Promise<Game[]> {
    return this.gameRepository.find();
  }


  async getMyGameRepo(id: number) : Promise<Game[]> {
    return this.gameRepository.find({where: {Player1: id}});
  }

  async add_games(Player1: number, Player2: number, score1: number, score2:number, hardcore: boolean) {
    const newGame = new Game();
    newGame.Player1 = Player1;
    newGame.Player2 = Player2;
    newGame.score1 = score1;
    newGame.score2 = score2;
    newGame.hardcore = hardcore;
    return this.gameRepository.save(newGame);
  }
}
