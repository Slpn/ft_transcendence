import { GameService } from './game.service';
import { Game } from './game.entity';
export declare class GameController {
    private readonly gameService;
    constructor(gameService: GameService);
    history(req: any, res: any): Promise<Game[]>;
    myHistory(req: any, res: any): Promise<Game[]>;
}
