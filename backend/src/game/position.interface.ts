import type { Socket } from 'socket.io-client'

export class Ball{
    x: number;
    y: number;
    r: number;
    speedX: number;
    speedY: number;
    xVel: number;
    yVel: number;
    size: number;
}

export class Player{
    socket;
    id: number;
    x: number;
    y: number;
    score: number;
    size: number;
}

export class Games {
    Ball1: Ball; 
    Ball2: Ball;
    Player1: Player;
    Player2: Player;
    room_id: string;
    hardcore: boolean = false;
    intervalId;
    number_user: number;
    size_paddle: number;
}
