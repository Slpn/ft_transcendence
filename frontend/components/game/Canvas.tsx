import React, {useEffect,useState,useRef} from "react";
import { getCookie } from 'cookies-next';
import { io, Socket } from "socket.io-client";
import NavBar from "../navBar";
import Footer from "../footer";
import Head from "next/head";
import Link from "next/link";
import Countdown from "react-countdown"

const Canvas = (props: { socket: any; player: any; opponent: any; ball: any; roomId: any; }) => {
	
	const canvasRef = useRef(null);
	const socket = props.socket;
	const canvas = useRef(null);
	var PLAYER_HEIGHT = 100;
	var PLAYER_WIDTH = 5;
	var OPPONENT_HEIGHT = 100;
	var OPPONENT_WIDTH  = 5;
	const player = props.player;
	const opponent = props.opponent;
	var ball = props.ball;
	const roomId = props.roomId;

	const [scorePlayer, setScorePlayer] = useState(0);
	const [scoreOpp, setScoreOpp] = useState(0);
	const [gameFinished, setGameFinished] = useState(false);

	const draw = () => {
		
		var context = canvas.current.getContext('2d');
		// Draw field
		context.fillStyle = 'black';
		context.fillRect(0, 0, canvas.current.width, canvas.current.height);
		// Draw middle line
		context.strokeStyle = 'white';	
		context.beginPath();
		context.moveTo(canvas.current.width / 2, 0);
		context.lineTo(canvas.current.width / 2, canvas.current.height);
		context.stroke();

		//draw players
		if (player && opponent) {
			context.fillStyle = 'white';
			context.fillRect(0, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
			context.fillRect(canvas.current.width - OPPONENT_WIDTH, opponent.y, OPPONENT_WIDTH, OPPONENT_HEIGHT);
		}

		// Draw ball
		if (ball) {
		context.beginPath();
		context.fillStyle = 'white';
		context.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2, false);
		context.fill();
		}
	} 

	const play = () => {
		draw();
		requestAnimationFrame(play);
	}

	useEffect(() => {
		const playerMove = (event) => {
			// Get the mouse location in the canvas
			var canvasLocation = canvas.current.getBoundingClientRect();
			var mouseLocation = event.clientY - canvasLocation.y;
			if (mouseLocation < PLAYER_HEIGHT / 2) {
				player.y = 0;
			} else if (mouseLocation > canvas.current.height - PLAYER_HEIGHT / 2) {
				player.y = canvas.current.height - PLAYER_HEIGHT;
			} else {
				player.y = mouseLocation - PLAYER_HEIGHT / 2;
			}
			socket.emit("sendPaddlePos", {y: player.y, roomId: props.roomId});
		}

		socket.on("getOppPos", (data) => {
			opponent.y = data.y;
		});

		
		socket.on("reducePaddle", (data) => {
			PLAYER_HEIGHT = data.size;
		});
		
		socket.on("reduceOppPaddle", (data) => {
			OPPONENT_HEIGHT = data.size;
		});
		
		socket.on("getBallPos", (data) => {
			ball.y = data.y;
			ball.x = data.x;
		});
		
		socket.on("getScore", (data) => {
			setScorePlayer(data.player);
			setScoreOpp(data.opponent);
			if (data.player == 5 || data.opponent == 5) {
				setGameFinished(true);
			}
		});
		
		socket.on("reduceBall", (data) => {
			ball.r = data.size;
		});

		socket.emit("getScore", {roomId: roomId});
		
		canvas.current = document.querySelector('canvas');
		canvas.current.addEventListener('mousemove', playerMove);
		play();
		
		return () => {
			canvas.current.removeEventListener('mousemove', playerMove);
			socket.off("getOppPos");
			socket.off("getBallPos");
			socket.off("getScore");
		}
	}, [])

	return (
		<>
		<div className="py-6 items-center relative">
				<div className="absolute top-0 left-1/2 transform -translate-x-1/2">
						<div className="flex justify-center items-center">
								<div className="text-2xl font-bold mr-2">{scoreOpp}</div>
								<div className="text-2xl font-bold">{scorePlayer}</div>
						</div>
							{gameFinished && (
									<div className="flex justify-center items-center text-lg font-bold mt-2">game is over</div>
							)}
						<canvas ref={canvasRef} width={800} height={600} />
				</div>
		</div>
		</>
		);
  };

export default Canvas;
