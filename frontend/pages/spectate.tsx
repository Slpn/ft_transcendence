import { authenticatedWrapper, getAuth } from "../utils/auth/wrapper";
import { httpClient } from "../utils/http-client";
import { GetServerSidePropsContext } from "next";
import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { io } from "socket.io-client";
import { getCookie } from 'cookies-next';
import NavBar from "../components/menu&footer/navBar";

const spectate = ({user}) => {

    const router = useRouter();
    const socketRef = useRef();
    const canvasRef = useRef();
    const query = router.query;
    const [scorePlayer, setScorePlayer] = useState(0);
    const [scoreOpp, setScoreOpp] = useState(0);
    const [gameFinished, setGameFinished] = useState(false);
    var player1_y;
    var player1_size;
    var player2_y;
    var player2_size;

    var ballY;
    var ballX;
    var ballR;


	const draw = () => {
		if (!canvasRef.current) {
      return;
    }
		var context = canvasRef.current.getContext('2d');
		// Draw field
		context.fillStyle = 'black';
		context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
		// Draw middle line
		context.strokeStyle = 'white';	
		context.beginPath();
		context.moveTo(canvasRef.current.width / 2, 0);
		context.lineTo(canvasRef.current.width / 2, canvasRef.current.height);
		context.stroke();

		//draw players
		if (player1_y && player2_y && player1_size && player2_size) {
			context.fillStyle = 'white';
			context.fillRect(0, player1_y , 5, player1_size);
			context.fillRect(canvasRef.current.width - 5, player2_y, 5, player2_size);
		}

		// Draw ball
		if (ballR && ballX && ballY) {
		context.beginPath();
		context.fillStyle = 'white';
		context.arc(ballX, ballY, ballR, 0, Math.PI * 2, false);
		context.fill();
		}
	} 

	const play = () => {
		draw();
		requestAnimationFrame(play);
	}

    useEffect(() => {
		socketRef.current = io('http://localhost:3001/', { query: {
			authToken: getCookie('Auth'),
		  }
		});

      socketRef.current.on("getPlayer1Info", (data) =>{
          player1_y = data.y;
          player1_size = data.size;
          setScorePlayer(data.score);
			   
      });

      socketRef.current.on("gameFinished", () =>{
        router.push("/game");
      });

      socketRef.current.on("getPlayer2Info", (data) =>{
        player2_y = data.y;
        player2_size = data.size;
        setScoreOpp(data.score);
      });

    socketRef.current.on("getBallInfo", (data) =>{
      ballR = data.ballR;
      ballX = data.ballX;
      ballY = data.ballY;
    });

    socketRef.current.emit("addSpectator", {roomId: query.roomId});

    play();
		return () => {
            socketRef.current.disconnect();
            socketRef.current.off("getGameInfo");
            socketRef.current.off("getPlayer1Info");
            socketRef.current.off("getPlayer2Info");
        }
    }, [])
    const LeaveGame = () => {
      router.push('/game');
    }
    return (
    <>
      <NavBar/>
      <button className="btn-play text-color-3" onClick={() => {LeaveGame()}}>
        leave game
      </button>
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
    )

}


export const getServerSideProps = authenticatedWrapper(
    async (context: GetServerSidePropsContext) => {
      const Auth = getAuth(context);
      const user = await httpClient.get(`${process.env.NEXT_PUBLIC_ME_ROUTE}`, {
        headers: {
          Cookie: `Auth=${Auth}`,
        },
      });
      return {
        props: {
          user: user.data,
          authToken: Auth,
        },
      };
    }
  );

  
export default spectate;
