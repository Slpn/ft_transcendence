import { useRouter } from "next/router";
import React, { SyntheticEvent, useState } from 'react';
import { authenticatedWrapper, getAuth } from "../../utils/auth/wrapper";
import NavBar from "../../components/menu&footer/navBar";
import Footer from "../../components/menu&footer/footer";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { httpClient } from "../../utils/http-client";
import Head from "next/head";
import Link from "next/link";
import Countdown from "react-countdown"

const Canvas = () => {
	const [startGame, setStartGame] = useState(false);
	const canvasRef = useRef(null);

	//Remplacer dans ce bloc les x et y par les x et y dynamiques de chaque player 
	// et la size par rapport a la difficulte
	const [player, setPlayer] = useState([
		{ id:"0", x: 0, y: 80, size: 120, score:0 }, 
		{ id:"1", x: 740, y: 0, size: 120, score:0 },
	])

	// ici c'est la balle, pas besoin de bouger
	const [ball, setBall] = useState ([
		{ id:"0", x: 500, y: 300, size: 20, xVel:1, yVel:1},
	])

	const [mousePos, setMousePos] = useState({});

	useEffect(() => {
		const handleMouseMove = (event) => {
		  setMousePos({ x: event.clientX, y: event.clientY });
		};
	
		window.addEventListener('mousemove', handleMouseMove);
		 drawOnCanvas();
		play();
		return () => {
		  window.removeEventListener(
			'mousemove',
			handleMouseMove
		  );
		};
	  }, []);

	const drawCanvas = (canvas, ctx) => {
		ctx.strokeStyle = 'rgb(43, 65, 98)';
		ctx.beginPath();
		// Commenter les 2 boucles for pour ne pas avoir la grille
		//   for (let x = 0; x <= canvas.width; x += 20) {
		// 	ctx.moveTo(x, 0);
		// 	ctx.lineTo(x, canvas.height);
		//   }
		//   for (let y = 0; y <= canvas.height; y += 20) {
		// 	ctx.moveTo(0, y);
		// 	ctx.lineTo(canvas.width, y);
		//   }
		for (let x = 0; x <= canvas.width; x += canvas.width/2) {
			ctx.moveTo(x, 0);
			ctx.lineTo(x, canvas.height);
		}

		for (let y = 0; y <= canvas.height; y += canvas.height) {
			ctx.moveTo(0, y);
			ctx.lineTo(canvas.width, y);
		}
		ctx.stroke();
		ctx.closePath();
	}

	const play = async () => {
		await drawOnCanvas();
		await moveBall();
		await handleMouseMove();
		requestAnimationFrame(play);
	}

	const drawPaddles = (ctx) => {
		for (let i = 0; i < 2; i++)
		{
			ctx.fillStyle= 'rgb(143, 117, 79)';
			ctx.beginPath();
			ctx.roundRect(player[i].x,player[i].y,20,player[i].size,50);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
	}

	const drawBall = (ctx) => {
		ctx.fillStyle= 'rgb(56, 95, 113)';
		ctx.beginPath();
		ctx.roundRect(ball[0].x,ball[0].y,ball[0].size,ball[0].size,50);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}

	const drawScore = (canvas,ctx) => {
		ctx.fillStyle = 'rgb(245, 240, 246)';
		ctx.font = 'bold 32px ui-sans-serif';
		ctx.fillText(player[0].score, canvas.width/2 - 100, 40);
		ctx.fillText(player[1].score, canvas.width/2 + 90, 40);
	}

	// Fonction responsable de dessigner sur le canvas
	const drawOnCanvas = () => {
		// Recuperation du canvas
	  const canvas = canvasRef.current;
	  if (canvas) {
			const ctx = canvas.getContext('2d');
			if (ctx) {
				// Effacer ce qui se trouve sur le canvas
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				// Dessiner les bordures
				drawCanvas(canvas, ctx);
				//Dessiner les raquettes
				drawPaddles(ctx);
				// Dessiner la balle
				drawBall(ctx);
				// Afficher le score
				drawScore(canvas, ctx);
			}
	  }
	};

	const handleMouseMove = () => {
		const canvas = canvasRef.current;
		if (canvas) {
		  const { top } = canvas.getBoundingClientRect();
		  let y = mousePos.y - top;
		  if (y + player[0].size > canvas.height) {
				y = canvas.height - player[0].size;
		  }
		  if (y <= 0){
				y = 0;
		  }
		  //if player 1 (les conditions pour bouger la raquette de droite)
		//   setPlayer([{x: player[0].x, y, size: player[0].size}, {x: player[1].x, y: player[1].y, size: player[1].size}]);
		  //else if player 2 (les conditions pour bouger la raquette de gauche)
		//   setplayer([{x: player[0].x, y:player[0].y, size: player[0].size}, {x: player[1].x, y, size: player[1].size}]);

		//Pour tester et bouger les deux raquettes en meme temps 
		setPlayer([{id: '0', x: player[0].x, y, size: player[0].size, score : player[0].score}, {id: '1', x: player[1].x, y, size: player[1].size, score : player[1].score}])
		}

	}
	
	const moveBall = () => {
		const canvas = canvasRef.current;
		if (canvas) {
			// speed a changer en fonction de la difficulte ? Attention, 1 ca va tres tres vite
			let speed:number = 0.5;
			// check top canvas bounds
			if (ball[0].y <= 0){
				ball[0].yVel = 2;
			}
			// check bottom canvas bounds
			if (ball[0].y + ball[0].size >= canvas.height) {
				ball[0].yVel = -1;
			}
			// check left canvas bounds
			if (ball[0].x <= 0){
				ball[0].x = canvas.width / 2 - ball[0].size / 2;
				player[1].score ++;
			}
			// check right canvas bounds 
			if (ball[0].x + ball[0].size >= canvas.width) {
				ball[0].x = canvas.width / 2 - ball[0].size / 2;
				player[0].score ++ ;
			}
			//check player 1 collision
			if (ball[0].x <= player[0].x + 20) {
				if (ball[0].y >= player[0].y && ball[0].y + ball[0].size <= player[0].y + player[0].size) {
					ball[0].xVel = 1;
				}
			} 
			//check player 2 collision
			if (ball[0].x + 20 >= player[1].x) {
				if (ball[0].y >= player[1].y && ball[0].y + ball[0].size <= player[1].y + player[0].size) {
					ball[0].xVel = -1;
				}
			} 
			ball[0].x += ball[0].xVel * speed;
			ball[0].y += ball[0].yVel * speed;
		}
	} 

	// useEffect(() => {
	// 		drawOnCanvas();
	// 		moveBall();
	// 		handleMouseMove();
	// }, [player, ball]);
  
	const Count = () => {
		if (startGame === true)
		{
			return (
				<Countdown date={Date.now() + 3000}/>
			)
		}
	}

	return (
		<>
		<NavBar/>
		<div className="py-6 flex items-center">
			<div>
				<canvas ref={canvasRef} width={760} height={660} />
			</div>
		</div>
		<Footer/>
		</>
		);
  };

export default Canvas;