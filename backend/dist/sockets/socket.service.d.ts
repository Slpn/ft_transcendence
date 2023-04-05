import { Server, Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { Games } from 'src/game/position.interface';
import { GlobalProvider } from './global.provider';
import { GameService } from 'src/game/game.service';
export declare class SocketService {
    private readonly userService;
    private globalProvider;
    private gameService;
    constructor(userService: UserService, globalProvider: GlobalProvider, gameService: GameService);
    socket: Server;
    usersSocketsMap: Map<number, Socket>;
    usersChannelMap: Map<number, number>;
    usersFriendRoomMap: Map<number, number>;
    matchmakingArray: Array<number>;
    hardcoreMatchmakingArray: Array<number>;
    playersInGameMap: Map<number, string>;
    gameMap: Map<string, Games>;
    PositionMap: Map<number, Games>;
    spectatorMap: Map<number, string>;
    getConnectedUser(channel_id: number): Promise<any[]>;
    getAllUsers(): any[];
    getInGameUsers(): {
        users: any[];
        room: any[];
    };
    getAllInfoGameUsers(): Promise<{
        users: any[];
        rooms: any[];
    }>;
    broadcastToChannel(event: string, data: any, channel_id: number): Promise<void>;
    broadcast(event: string, data: any): Promise<void>;
    broadcastGame(roomId: string, game: any): Promise<void>;
    removeSpectator(roomId: string): Promise<void>;
    collidePlayer1(game: Games): Promise<void>;
    collidePlayer2(game: Games): Promise<void>;
    moveBall(game: Games): Promise<void>;
}
