import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { Ball, Games, Player } from 'src/game/position.interface';
import { GlobalProvider } from './global.provider';
import { GameService } from 'src/game/game.service';

const PLAYER_HEIGHT: number = 100;
const PLAYER_WIDTH: number = 5

@Injectable()
export class SocketService {
	

constructor ( private readonly userService: UserService,
                private globalProvider: GlobalProvider,
                private gameService: GameService
    ) {}

 public socket: Server = null;
 public usersSocketsMap: Map<number, Socket> = new Map<number, Socket>();
 public usersChannelMap: Map<number, number> = new Map<number, number>();
 public usersFriendRoomMap: Map<number, number> = new Map<number, number>();

 public matchmakingArray: Array<number> = new Array<number>();//never free
 public hardcoreMatchmakingArray: Array<number> = new Array<number>();//never free
 public playersInGameMap: Map<number, string> = new Map<number, string>();//never free

 public gameMap: Map<string, Games> = new Map<string, Games>();

 public PositionMap: Map<number, Games> = new Map<number, Games>();
 public spectatorMap: Map<number, string> = new Map<number, string>();

 
 async getConnectedUser(channel_id: number){
    const users = [];
    let i: number = 0;
    for (let [key, value] of this.usersChannelMap){
        if (value == channel_id){
            const user = await this.userService.getUserById(key);
            users[i] = user;
            i++;
        }
    }
    return users;
 }

  getAllUsers(){
    const users = [];
    let i: number = 0;
    for (let [key] of this.usersSocketsMap){
            users[i] = key;
            i++;
    }
    return users;
 }

  getInGameUsers(){
	const users = [];
    const room = []
	let i: number = 0;
	for (let [key] of this.playersInGameMap){
		users[i] = key;
        room[i] = this.playersInGameMap.get(key);
		i++;
	}
	return {users, room};
 }

 async getAllInfoGameUsers() {
    const users = [];
    const rooms = [];
    let i = 0;
    for (let [key, value] of this.playersInGameMap) {
        const user = await this.userService.getUserById(key);
        users.push(user);
        rooms[i] = value;
        i++;
    }
    return {users, rooms}
 }

 async broadcastToChannel(event:string, data: any, channel_id: number){
    for (let [key, value] of this.usersChannelMap){
        if (value == channel_id){
            const user = await this.usersSocketsMap.get(key);
            await user.emit(event, data);
        }
    }
 }

 async broadcast(event:string, data: any){
    
     for (let [key] of this.usersSocketsMap){
        const user = await this.usersSocketsMap.get(key);
        await user.emit(event, data);
     }
 }

 async broadcastGame(roomId: string, game: any) {
    for (let [key, value] of this.spectatorMap) {
        if (value == roomId) {
            const user = await this.usersSocketsMap.get(key);
            user.emit("getPlayer1Info", {y: game.Player1.y, size: game.Player1.size, score: game.Player1.score}); 
            user.emit("getPlayer2Info", {y: game.Player2.y, size: game.Player2.size, score: game.Player2.score}); 
            user.emit("getBallInfo", {ballX: game.Ball1.x, ballY: game.Ball1.y, ballR: game.Ball1.r})
        } 
    }
 }

 async removeSpectator(roomId: string) {
    for (let [key, value] of this.spectatorMap) {
        if (value == roomId) {
            const user = await this.usersSocketsMap.get(key);
            await this.spectatorMap.delete(key);
            if (user) {
                user.emit("gameFinished");
            }
        } 
    }
 }

 async collidePlayer1(game: Games) {
    // The player1 does not hit the ball
    if (game.Ball1.y < game.Player1.y || game.Ball1.y > game.Player1.y + PLAYER_HEIGHT) { 
        // Set ball and players to the center
        game.Ball1.x = 800 / 2;
        game.Ball1.y = 600 / 2;
		game.Ball2.x = 800 / 2;
        game.Ball2.y = 600 / 2;
        game.Player1.y = 600 / 2 - PLAYER_HEIGHT / 2;
        game.Player2.y = 600 / 2 - PLAYER_HEIGHT / 2;

        if (game.hardcore == true) {
            game.Ball1.r = 5;
            game.Ball2.r = 5;
            game.Player1.size = 100;
            game.Player2.size = 100;
            game.Player1.socket.emit("reducePaddle", {size: game.Player1.size});
            game.Player2.socket.emit("reduceOppPaddle", {size: game.Player1.size});
    
            game.Player2.socket.emit("reducePaddle", {size: game.Player2.size});
            game.Player1.socket.emit("reduceOppPaddle", {size: game.Player2.size});
        }
        
        // Reset speed
        game.Ball1.speedX = 5;
		game.Ball2.speedX = 5;

        game.Player2.score += 1;
        game.Player1.socket.emit("getScore", {player: game.Player1.score, opponent: game.Player2.score});
        game.Player2.socket.emit("getScore", {player: game.Player2.score, opponent: game.Player1.score});
    } else {
        if (game.hardcore == true) {
            game.Ball2.r > 1.5 ? game.Ball2.r -= 0.5 : null;
            game.Player1.socket.emit("reduceBall", {size: game.Ball1.r});
            game.Player2.socket.emit("reduceBall", {size: game.Ball1.r});
            game.Player1.size > 20 ? game.Player1.size -= 10 : null;
            game.Player1.socket.emit("reducePaddle", {size: game.Player1.size});
            game.Player2.socket.emit("reduceOppPaddle", {size: game.Player1.size});
        }
        // Increase speed and change direction
        game.Ball1.speedX *= -1.2;
		game.Ball2.speedX *= -1.2; 
    }
}

async collidePlayer2(game: Games) {
    // The player2 does not hit the ball
    if (game.Ball2.y < game.Player2.y || game.Ball2.y > game.Player2.y + PLAYER_HEIGHT) {
        // Set ball and players to the center
        game.Ball1.x = 800 / 2; 
        game.Ball1.y = 600 / 2;
		game.Ball2.x = 800 / 2;
        game.Ball2.y = 600 / 2;
        game.Player1.y = 600 / 2 - PLAYER_HEIGHT / 2;
        game.Player2.y = 600 / 2 - PLAYER_HEIGHT / 2;

        if (game.hardcore == true) {
            game.Ball1.r = 5;
            game.Ball2.r = 5;
            game.Player1.size = 100;
            game.Player2.size = 100;
            game.Player1.socket.emit("reducePaddle", {size: game.Player1.size});
            game.Player2.socket.emit("reduceOppPaddle", {size: game.Player1.size});
    
            game.Player2.socket.emit("reducePaddle", {size: game.Player2.size});
            game.Player1.socket.emit("reduceOppPaddle", {size: game.Player2.size});
        }
        // Reset speed
        game.Ball1.speedX = 5;
		game.Ball2.speedX = 5;

        game.Player1.score += 1;
        game.Player1.socket.emit("getScore", {player: game.Player1.score, opponent: game.Player2.score});
        game.Player2.socket.emit("getScore", {player: game.Player2.score, opponent: game.Player1.score});
    } else {
        if (game.hardcore == true) {
            game.Ball1.r > 1.5 ? game.Ball1.r -= 0.5 : null;
            game.Player1.socket.emit("reduceBall", {size: game.Ball1.r});
            game.Player2.socket.emit("reduceBall", {size: game.Ball1.r});
            game.Player2.size > 20 ? game.Player2.size -= 10 : null;
            game.Player2.socket.emit("reducePaddle", {size: game.Player2.size});
            game.Player1.socket.emit("reduceOppPaddle", {size: game.Player2.size});
        }
        // Increase speed and change direction
        game.Ball1.speedX *= -1.2;
		game.Ball2.speedX *= -1.2;
    }
}

 async moveBall(game: Games) {
        game.intervalId = setInterval(async () => {
			if (game.Ball1.y > 600 - 5 || game.Ball1.y < 5) {
				game.Ball1.speedY *= -1;
			}
			if (game.Ball2.y > 600 - 5 || game.Ball2.y < 5) {
				game.Ball2.speedY *= -1;
			}

			if (game.Ball1.x > 800) {
				this.collidePlayer1(game);
			} 
			if (game.Ball1.x < 0) {
				this.collidePlayer2(game);
			}

			game.Ball1.x += game.Ball1.speedX;
            game.Ball1.y += game.Ball1.speedY;

            game.Ball2.x += game.Ball2.speedX * (-1);
            game.Ball2.y += game.Ball2.speedY;

            game.Player1.socket.emit("getBallPos", game.Ball1);
            game.Player2.socket.emit("getBallPos", game.Ball2);
            this.broadcastGame(game.room_id, game);

            if (game.Player1.score >= 5 || game.Player2.score >= 5) {
                if (game.hardcore == true) {
                    this.gameService.add_games(game.Player1.id, game.Player2.id, game.Player2.score, game.Player1.score, true);
                }
                else {
                    this.gameService.add_games(game.Player1.id, game.Player2.id, game.Player2.score, game.Player1.score, false);
                }
                const info = this.getAllInfoGameUsers();
                this.broadcast("getAllGame", info);
                if (game.Player1.score >= 5) {
                    this.userService.addXp(game.Player2.id);
                    this.userService.addWin(game.Player2.id);
                    this.userService.addLoose(game.Player1.id);
                }
                else if (game.Player2.score >= 5) {
                    this.userService.addXp(game.Player1.id);
                    this.userService.addWin(game.Player1.id);
                    this.userService.addLoose(game.Player2.id);
                }
                // this.gameService.add_games(game.Player2.id, game.Player1.id, game.Player2.score, game.Player1.score);
                clearInterval(game.intervalId);
            }
        }, 0.025 * 1000);
    }
}

