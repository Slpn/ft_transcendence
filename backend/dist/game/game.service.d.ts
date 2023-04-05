import { Repository } from 'typeorm';
import { Game } from './game.entity';
import { JwtService } from '@nestjs/jwt';
export declare class GameService {
    private gameRepository;
    private jwtService;
    constructor(gameRepository: Repository<Game>, jwtService: JwtService);
    getGameRepo(): Promise<Game[]>;
    getMyGameRepo(id: number): Promise<Game[]>;
    add_games(Player1: number, Player2: number, score1: number, score2: number, hardcore: boolean): Promise<Game>;
}
