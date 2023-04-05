import {ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayDisconnect} from "@nestjs/websockets"
import { Server, Socket} from "socket.io";
import { ChannelService } from "src/channel/channel.service";
import { Ball, Games, Player } from "src/game/position.interface";
import { MessageService } from "src/messages/message.service";
import { UserService } from '../user/user.service';
import { SocketService } from "./socket.service";
import { GlobalProvider } from "./global.provider";

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})

export class SocketEvents implements OnGatewayDisconnect{

    constructor ( private readonly socketService: SocketService,
                    private readonly userService: UserService,
                    private readonly messageService: MessageService,
                    private readonly channelService: ChannelService,
    ) {}

    
    @WebSocketServer()
    server: Server;

    //connexion
    async handleConnection(client : Socket){
        const token = client.handshake.query.authToken as string;
        const decodedToken = await this.userService.decodeJwtToken(token);
        
        if (this.socketService.usersSocketsMap.has(decodedToken.sub)){
            client.emit("alreadyLogged", {message: "You are already logged"});
            return ;
        }
        else {
            this.socketService.usersSocketsMap.set(decodedToken.sub, client); 
            const users = await this.socketService.getAllUsers();
            await this.socketService.broadcast("get_loggedUsers", users);
            if (this.socketService.playersInGameMap.has(decodedToken.sub))
            {
                const game = this.socketService.gameMap.get(this.socketService.playersInGameMap.get(decodedToken.sub));
                game.Player1.id == decodedToken.sub ? game.Player1.socket = client : game.Player2.socket = client;
                await client.emit("youAreInGame", {
                    room: this.socketService.playersInGameMap.get(decodedToken.sub),
                    player1: {id: game.Player1.id, y: game.Player1.y, x: game.Player1.x, score: game.Player1.score, size: game.Player1.size},
                    player2: {id: game.Player2.id, y: game.Player2.y, x: game.Player2.x, score: game.Player2.score, size: game.Player2.size},
                    ball1: game.Ball1,
                    ball2: game.Ball2
                });
            }
        }
    }

    //deconnexion
    async handleDisconnect(client: Socket){
        const token = client.handshake.query.authToken as string;
        const decodedToken = await this.userService.decodeJwtToken(token);
        this.socketService.usersSocketsMap.delete(decodedToken.sub);
        const logged = await this.socketService.getAllUsers();
        await this.socketService.broadcast("get_loggedUsers", logged);
        if (this.socketService.usersChannelMap.has(decodedToken.sub)) {
            const channel_id = await this.socketService.usersChannelMap.get(decodedToken.sub);
            await this.socketService.usersChannelMap.delete(decodedToken.sub);
            const users =  await this.socketService.getConnectedUser(channel_id);
            await this.socketService.broadcastToChannel("get_connected_users", {users}, channel_id);
            const logged = await this.socketService.getAllUsers();
        }
        if (await this.socketService.usersFriendRoomMap.has(decodedToken.sub)) {
            await this.socketService.usersFriendRoomMap.delete(decodedToken.sub);
        }
        if (await this.socketService.matchmakingArray.includes(decodedToken.sub)) {
            const ret = await this.socketService.matchmakingArray.indexOf(decodedToken.sub);
            await this.socketService.matchmakingArray.splice(ret, 1);
        }
        if (await this.socketService.spectatorMap.has(decodedToken.sub)) {
            await this.socketService.spectatorMap.delete(decodedToken.sub);
        }
    }

    @SubscribeMessage('join_channel')
    async join_channel(@ConnectedSocket() client, @MessageBody() data){
        const channel = this.channelService.getChannelById(data.channel.id);
        if (!data.channel || !channel) {
            return ;
        }
        const token = client.handshake.query.authToken as string;
        const decodedToken = await this.userService.decodeJwtToken(token);
        if (this.socketService.usersChannelMap.has(decodedToken.sub)){
            const previous_channel_id = this.socketService.usersChannelMap.get(decodedToken.sub);
            this.socketService.usersChannelMap.delete(decodedToken.sub);
            const users = await this.socketService.getConnectedUser(previous_channel_id);
            await this.socketService.broadcastToChannel("get_connected_users", {users}, previous_channel_id);
        }
        this.socketService.usersChannelMap.set(data.user_id, data.channel.id);
        const users = await this.socketService.getConnectedUser(data.channel.id);
        await this.socketService.broadcastToChannel("get_connected_users", {users}, data.channel.id);
    }

    @SubscribeMessage('leave_channel')
    async leave_channel(@ConnectedSocket() client, @MessageBody() data){
        const channel = this.channelService.getChannelById(data.channel_id);
        if (!data.channel || !channel) {
            return ;
        }
        const token = client.handshake.query.authToken as string;
        const decodedToken = await this.userService.decodeJwtToken(token);
        if (this.socketService.usersChannelMap.has(decodedToken.sub)){
            this.socketService.usersChannelMap.delete(decodedToken.sub);
            const users = await this.socketService.getConnectedUser(data.channel_id);
            await this.socketService.broadcastToChannel("get_connected_users", {users}, data.channel_id);
        }
    }


    @SubscribeMessage('join_friend_room')
    async join_friend_channel(@ConnectedSocket() client, @MessageBody() data){
        const user = await this.userService.getUserById(data.friend);
        if (!user){
            return ;
        }
        const token = client.handshake.query.authToken as string;
        const decodedToken = await this.userService.decodeJwtToken(token);
        if (this.socketService.usersChannelMap.has(decodedToken.sub)){
            await this.socketService.usersChannelMap.delete(decodedToken.sub);
        }
        await this.socketService.usersFriendRoomMap.set(data.user_id, data.friend);
    }

    @SubscribeMessage('message')
    async handleMessage(@ConnectedSocket() client, @MessageBody() data){

        if (!data.channel || !data.message) {
            return ;
        }
        const token = client.handshake.query.authToken as string;
        const decodedToken = await this.userService.decodeJwtToken(token);
        const sender = await this.userService.getUserById(decodedToken.sub);
        const channel_id: number = data.channel.id;
        // const mute = await this.channelService.getMutebyUserAndChannelId(sender.id, channel_id);
        const check = await this.channelService.checkMuteUser(sender.id, channel_id);
        const ban = await this.channelService.getBanByUserAndChannel(sender.id, channel_id);
        if (!check) {
            await client.emit("new_message", {message: "You are mute on this channel"});
            return ;
        }
        if (ban) {
            return ;
        }
        await this.messageService.createMessage(sender.id, channel_id, data.message);
        for (let [key, value] of this.socketService.usersChannelMap){
            const block_1 = await this.userService.getBlockByBothId(key, sender.id);
            const block_2 = await this.userService.getBlockByBothId(sender.id, key);
            if (block_1 && block_1.blocked == sender.id) {
                continue ;
            }
            if (block_2 && block_2.blocked == key){
                continue ;
            }
            if (value == channel_id ) {
                client = this.socketService.usersSocketsMap.get(key);
                await client.emit("new_message", {message: data.message, user: sender});
            }
        }
    }

    @SubscribeMessage('kick_from_channel')
    async kickFromChannel(@ConnectedSocket() client, @MessageBody() data){
        const channel_id: number = data.channel_id;
        const user_id: number = data.user_id;
        if (await this.socketService.usersChannelMap.has(user_id)){
            const user = await this.socketService.usersSocketsMap.get(user_id);
            user.emit("get_kicked", {message: "success"});
            await this.socketService.usersChannelMap.delete(user_id);
            const users = await this.socketService.getConnectedUser(channel_id);
            await this.socketService.broadcastToChannel("get_connected_users", {users}, channel_id);
        }

    }

    @SubscribeMessage('ban_from_channel')
    async ban_from_channel(@ConnectedSocket() client, @MessageBody() data){
        const channel_id: number = data.channel_id;
        const user_id: number = data.user_id;
        if (await this.socketService.usersChannelMap.has(user_id)){
            await this.channelService.banUser(user_id, channel_id);
            const user = await this.socketService.usersSocketsMap.get(user_id);
            await user.emit("get_banned", {message: "success"});
            await this.socketService.usersChannelMap.delete(user_id);
            const users = await this.socketService.getConnectedUser(channel_id);
            await this.socketService.broadcastToChannel("get_connected_users", {users}, channel_id);
        }

    }

    @SubscribeMessage('unban_from_channel')
    async unban_from_channel(@ConnectedSocket() client, @MessageBody() data){
        const channel_id: number = data.channel_id;
        const user_id: number = data.user_id;
        if (this.socketService.usersSocketsMap[user_id]) {
            const user =  await this.socketService.usersSocketsMap.get(user_id);
            await user.emit("get_unbanned");
        }
    }

    @SubscribeMessage('private_message')
    async handlePrivateMessage(@ConnectedSocket() client, @MessageBody() data){
        const receiver = await this.userService.getUserById(data.receiver);
        if (!data.receiver || !data.message || !receiver) {
            return ;
        }
        const token = client.handshake.query.authToken as string;
        const decodedToken = await this.userService.decodeJwtToken(token);
        const sender = await this.userService.getUserById(decodedToken.sub);
        const block = await this.userService.getBlockByBothId(sender.id, receiver.id);
        await this.messageService.createPrivateMessage(sender.id, receiver.id, data.message);
        if (this.socketService.usersFriendRoomMap.has(sender.id)){
            const user = await this.socketService.usersSocketsMap.get(decodedToken.sub)
            await user.emit("new_private_message", {message: data.message, user: sender});
        }
        const user_id = this.socketService.usersFriendRoomMap.get(receiver.id);
        if (this.socketService.usersFriendRoomMap.has(receiver.id) && (user_id == sender.id) && !block){
            const user = await this.socketService.usersSocketsMap.get(receiver.id);
            await user.emit("new_private_message", {message: data.message, user: sender});
        }
    }

    @SubscribeMessage('get_connected_users')
    async getConnectedUsers(@ConnectedSocket() client, @MessageBody() data){
        const channel_id: number = data.channel.id;
        const users = await this.socketService.getConnectedUser(channel_id);
        await client.emit("get_connected_users", {users});
    }

    @SubscribeMessage('get_all_users')
    async getAllUsers(@ConnectedSocket() client, @MessageBody() data){
        const channel_id: number = data.channel.id;
        const users = await this.socketService.getConnectedUser(channel_id);
        await client.emit("get_connected_users", {users});
    }

    @SubscribeMessage('promote_to_admin')
    async promoteToAdmin(@ConnectedSocket() client, @MessageBody() data){
        const user_id: number = data.user_id;
        const user = await this.socketService.usersSocketsMap.get(user_id);
        await user.emit("get_promoted");
    }

    @SubscribeMessage('demote_to_user')
    async demoteToUser(@ConnectedSocket() client, @MessageBody() data){
        const user_id: number = data.user_id;
        const user = await this.socketService.usersSocketsMap.get(user_id);
        await user.emit("get_demoted");
    }

@SubscribeMessage('addSpectator')
async spectate(@ConnectedSocket() client, @MessageBody() data) {
    const token = client.handshake.query.authToken as string;
    const decodedToken = await this.userService.decodeJwtToken(token);  
    const roomId = data.roomId;
    this.socketService.spectatorMap.set(decodedToken.sub, roomId);
}


    /*** MATCHING  ***/
    
    removeFromQueue(id: number){
		let newArray = Array();
		let i = -1;
		const index = this.socketService.matchmakingArray.indexOf(id);

		while (++i < this.socketService.matchmakingArray.length)
		{
			if (i != index)
				newArray.push(this.socketService.matchmakingArray[i]);
		}
		this.socketService.matchmakingArray = newArray;
		this.socketService.matchmakingArray.length = newArray.length;
	}

    removeFromHardcoreQueue(id: number){
		let newArray = Array();
		let i = -1;
		const index = this.socketService.hardcoreMatchmakingArray.indexOf(id);

		while (++i < this.socketService.hardcoreMatchmakingArray.length)
		{
			if (i != index)
				newArray.push(this.socketService.hardcoreMatchmakingArray[i]);
		}
		this.socketService.hardcoreMatchmakingArray = newArray;
		this.socketService.hardcoreMatchmakingArray.length = newArray.length;
	}

	@SubscribeMessage('matchmaking')
	async addPlayerToQueue(@ConnectedSocket() client, @MessageBody() data){

		if (!this.socketService.matchmakingArray.includes(data.id))
			this.socketService.matchmakingArray.push(data.id);
		else
        {
            const user = this.socketService.usersSocketsMap.get(data.id);
            user.emit("cancel");
			this.removeFromQueue(data.id);
        }
		if (this.socketService.matchmakingArray.length > 1)
		{
			const roomId = crypto.randomUUID();
			const idPlayer1 = this.socketService.matchmakingArray[0];
			const idPlayer2 = this.socketService.matchmakingArray[1];
            let player1: Player = new Player();
            let player2: Player = new Player();
            let ball: Ball = new Ball();
            let ball2: Ball = new Ball();
            let game: Games = new Games();

            player1.id = idPlayer1;
            player1.socket = this.socketService.usersSocketsMap.get(idPlayer1);
			player1.x= 0;
			player1.y= 600/2;
            player1.score = 0;
            player1.size = 100;

            player2.id = idPlayer2;
            player2.socket = this.socketService.usersSocketsMap.get(idPlayer2);
            player2.x= 0;
			player2.y= 600/2;
            player2.score = 0;
            player2.size = 100;

            ball.x = 800/2;
            ball.y = 600/2;
            ball.r = 5;
            ball.speedX = 5;
            ball.speedY = 5;

            ball2.x = 800/2;
            ball2.y = 600/2;
            ball2.r = 5;
            ball2.speedX = 5;
            ball2.speedY = 5;
            
            game.Player1 = player1;
            game.Player2 = player2;
            game.Ball1 = ball; 
            game.Ball2 = ball2;
            game.hardcore = false;
            game.room_id = roomId;

			this.socketService.playersInGameMap.set(idPlayer1, roomId);
			this.socketService.playersInGameMap.set(idPlayer2, roomId);

            this.socketService.gameMap.set(roomId, game);
			player1.socket.emit("match", {me: {y: 800 / 2}, opponent: {y: 800 / 2}, roomId: roomId, ball: game.Ball1});
            player2.socket.emit("match", {me: {y: 800 / 2}, opponent: {y: 800 / 2}, roomId: roomId, ball: game.Ball2});
            
			this.removeFromQueue(idPlayer1);
			this.removeFromQueue(idPlayer2);

            const users = await this.socketService.getInGameUsers();
            const info = await this.socketService.getAllInfoGameUsers();
            await this.socketService.broadcast("get_inGameUsers", users);
            await this.socketService.broadcast("getAllGame", info);
            this.socketService.moveBall(game);
		}
	}

    @SubscribeMessage('matchmakingHardcore')
	async addPlayerToHardcoreQueue(@ConnectedSocket() client, @MessageBody() data){
		if (await !this.socketService.hardcoreMatchmakingArray.includes(data.id))
			await this.socketService.hardcoreMatchmakingArray.push(data.id);
		else
        {
            const user = await this.socketService.usersSocketsMap.get(data.id);
            user.emit("cancel");
			await this.removeFromHardcoreQueue(data.id);
        }
		if (this.socketService.hardcoreMatchmakingArray.length > 1)
		{
			const roomId = crypto.randomUUID();
			const idPlayer1 = this.socketService.hardcoreMatchmakingArray[0];
			const idPlayer2 = this.socketService.hardcoreMatchmakingArray[1];
            let player1: Player = new Player();
            let player2: Player = new Player();
            let ball: Ball = new Ball();
            let ball2: Ball = new Ball();
            let game: Games = new Games();

            player1.id = idPlayer1;
            player1.socket = await this.socketService.usersSocketsMap.get(idPlayer1);
			player1.x= 0;
			player1.y= 600/2;
            player1.score = 0;
            player1.size = 100;

            player2.id = idPlayer2;
            player2.socket = await this.socketService.usersSocketsMap.get(idPlayer2);
            player2.x= 0;
			player2.y= 600/2;
            player2.score = 0;
            player2.size = 100;

            ball.x = 800/2;
            ball.y = 600/2;
            ball.r = 5;
            ball.speedX = 5;
            ball.speedY = 5;

            ball2.x = 800/2;
            ball2.y = 600/2;
            ball2.r = 5;
            ball2.speedX = 5;
            ball2.speedY = 5;
            
            game.Player1 = player1;
            game.Player2 = player2;
            game.Ball1 = ball; 
            game.Ball2 = ball2;
            game.hardcore = true;
            game.room_id = roomId;

			await this.socketService.playersInGameMap.set(idPlayer1, roomId);
			await this.socketService.playersInGameMap.set(idPlayer2, roomId);

            await this.socketService.gameMap.set(roomId, game);
			player1.socket.emit("match", {me: {y: 800 / 2}, opponent: {y: 800 / 2}, roomId: roomId, ball: game.Ball1});
            player2.socket.emit("match", {me: {y: 800 / 2}, opponent: {y: 800 / 2}, roomId: roomId, ball: game.Ball2});

            const users = await this.socketService.getInGameUsers();
            const info = await this.socketService.getAllInfoGameUsers();
            await this.socketService.broadcast("get_inGameUsers", users);
            await this.socketService.broadcast("getAllGame", info);

			await this.removeFromHardcoreQueue(idPlayer1);
			await this.removeFromHardcoreQueue(idPlayer2);
            await this.socketService.moveBall(game);
		}
	}

	@SubscribeMessage('getPlayerInfos')
	getPlayerInfos(@ConnectedSocket() client, @MessageBody() data) {
		if (this.socketService.matchmakingArray.includes(data.id))
			client.emit("playerInfos", "cancel");
		else if (this.socketService.playersInGameMap.has(data.id))
			client.emit("playerInfos", "play");
		else
			client.emit("playerInfos", "matching");
	}

	@SubscribeMessage('leaveGame')
	async leaveGame(@ConnectedSocket() client, @MessageBody() data) {
		const id2 = this.socketService.playersInGameMap[data.id];
		for (let [key, value] of this.socketService.playersInGameMap.entries())
			if (key != data.id && value == this.socketService.playersInGameMap.get(data.id))
			{
				this.socketService.playersInGameMap.delete(key);
                const user = this.socketService.usersSocketsMap.get(key);
				user.emit("giveUp");
			}
        let game = this.socketService.gameMap.get(data.roomId);
        this.socketService.playersInGameMap.delete(game.Player1.id);
        this.socketService.playersInGameMap.delete(game.Player2.id);
		this.socketService.gameMap.delete(data.roomId);

        clearInterval(game.intervalId);
        const users = this.socketService.getInGameUsers();
        await this.socketService.broadcast("get_inGameUsers", users);
        await this.socketService.removeSpectator(data.roomId);
	}
		// this.socketService.playersInGameMap.delete(data.id);

    @SubscribeMessage("sendPaddlePos")
    sendPaddlePos(@ConnectedSocket() client, @MessageBody() data) {
        const token = client.handshake.query.authToken as string;
        const decodedToken = this.userService.decodeJwtToken(token);
        const sender: number = decodedToken.sub;
        var game: Games = this.socketService.gameMap.get(data.roomId);
		if (game) {
			if (game.Player1.id == sender) {
			game.Player2.y = data.y;
            game.Player2.socket.emit("getOppPos", {y: data.y})
			}
			else if (game.Player2.id = sender) {
				game.Player1.y = data.y;
				game.Player1.socket.emit("getOppPos", {y: data.y});
			}
		}
    }

	@SubscribeMessage('askingInGameUsers')
	askingInGameUsers(@ConnectedSocket() client) {
		client.emit("get_inGameUsers", this.socketService.getInGameUsers());
	}

	@SubscribeMessage('inviteNotif')
	inviteFriendToPlay(@MessageBody() data) {
		if (this.socketService.usersSocketsMap.has(data.id))
			this.socketService.usersSocketsMap.get(data.id).emit("youAreInvitedToPlay", data.sender);
	}

	@SubscribeMessage('gameInvitationDeclined')
	gameInvitationDeclined(@MessageBody() data) {
		if (this.socketService.usersSocketsMap.has(data.waitingPlayer.id))
			this.socketService.usersSocketsMap.get(data.waitingPlayer.id).emit("cancel");
	}

	@SubscribeMessage('gameInvitAccepted')
	gameInvitAccepted(@MessageBody() data) {
		if (this.socketService.usersSocketsMap.has(data.sender.id))
		this.socketService.usersSocketsMap.get(data.sender.id).emit("gameAccepted");
	}

	@SubscribeMessage('cancelNotif')
	cancelNotif(@MessageBody() data) {
		if (this.socketService.usersSocketsMap.has(data.id))
			this.socketService.usersSocketsMap.get(data.id).emit('notifCanceled', data.sender);
	}


	@SubscribeMessage('getScore')
	getScore(@ConnectedSocket() client, @MessageBody() data) {
        const token = client.handshake.query.authToken as string;
        const decodedToken = this.userService.decodeJwtToken(token);
        const id: number = decodedToken.sub;
        const game = this.socketService.gameMap.get(data.roomId);
        if (game) {
            if (game.Player1.id == id) {
                client.emit("getScore", {player: game.Player1.score, opponent: game.Player2.score});
            }
            else {
                client.emit("getScore", {player: game.Player2.score, opponent: game.Player1.score});
            }
        }
	}

	@SubscribeMessage('launchGameWithFriend')
	async launchGameWithFriend(@MessageBody() data) {
		const roomId = crypto.randomUUID();

		let player1: Player = new Player();
        let player2: Player = new Player();
        let ball: Ball = new Ball();
        let ball2: Ball = new Ball();
        let game: Games = new Games();

        player1.id = data.player1.id;
        player1.socket = this.socketService.usersSocketsMap.get(data.player1.id);
        player2.id = data.player2.id;
        player2.socket = this.socketService.usersSocketsMap.get(data.player2.id);

		player1.y = 600/2;
        player1.score = 0;
        player1.size = 100;
		player2.y = 600/2;
        player2.score = 0;
        player2.size = 100;

        ball.x = 800/2;
        ball.y = 600/2;
        ball.r = 5;
        ball.speedX = 5;
        ball.speedY = 5;

        ball2.x = 800/2;
        ball2.y = 600/2;
        ball2.r = 5;
        ball2.speedX = 5;
        ball2.speedY = 5;
            
        game.Player1 = player1;
        game.Player2 = player2;
        game.Ball1 = ball; 
        game.Ball2 = ball2; 
		game.room_id = roomId;

		this.socketService.playersInGameMap.set(data.player1.id, roomId);
		this.socketService.playersInGameMap.set(data.player2.id, roomId);

        this.socketService.gameMap.set(roomId, game);

		player1.socket.emit("match", {me: {y: 800 / 2}, opponent: {y: 800 / 2}, roomId: roomId, ball: game.Ball1});
        player2.socket.emit("match", {me: {y: 800 / 2}, opponent: {y: 800 / 2}, roomId: roomId, ball: game.Ball2});

		const users = await this.socketService.getInGameUsers();
        const info = await this.socketService.getAllInfoGameUsers();
       	await this.socketService.broadcast("get_inGameUsers", users);
        await this.socketService.broadcast("getAllGame", info);

        this.socketService.moveBall(game);
	}

    @SubscribeMessage('getAllGame')
	async getAllGame(@ConnectedSocket() client, @MessageBody() data) {
        const info = await this.socketService.getAllInfoGameUsers();
        await this.socketService.broadcast("getAllGame", info);
    }
}

