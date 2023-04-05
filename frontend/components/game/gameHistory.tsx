import { httpClient } from "../../utils/http-client";
import { useState, useEffect} from 'react'
import Avatar from "../avatar/Avatar";
import AvatarMini from "../avatar/Avatarmini";
import Avatarmini from "../avatar/Avatarmini";

class gameHistory {
	Player1: number;
	Player2:number;
	score1:number;
	score2:number;
	winner:number;
	constructor(Player1: number, Player2: number, score1: number, score2: number, winner:number) {
		this.Player1 = Player1;
		this.Player2=Player2;
		this.score1=score1;
		this.score2=score2;
		this.winner=winner;
	}
}

const GameHistory = () => {
	const [game, setGame] = useState(null);
	const [P1, setP1] = useState(null);
	const [P2, setP2] = useState(null);
	const [state, setState] = useState(null);
	const [user, setUser] = useState(null);
	const [id, setId] = useState(null);
	const [username, setUsername] = useState(null);
	const [xp, setXp] = useState(null);
	const [avatar, setAvatar] = useState(null);
	useEffect(() => {
		let mounted = true;
		httpClient.get("http://localhost:3001/game/history")
		.then((response) => {
			if (mounted) {
				setGame(response.data)
				setP1(response.data.Player1)
				setP2(response.data.Player2)
				setState(response.data.state)
			}
		  }),
		httpClient.get("http://localhost:3001/user/me")
		.then((user) => {
			if (mounted) {
				setUser(user.data),
				setId(user.data.id)
				setUsername(user.data.username)
				setAvatar(user.data.avatar)
			}
		  });
		  
	
	  }, [])

	  let history:gameHistory = [];
	  let i : number = 0;
	  let j : number = 0;
	  if (game) {
		while (i < game.length) {
			if (game[i].Player1 == id || game[i].Player2  == id) {
				history[j] = new gameHistory(game[i].Player1, game[i].Player2, game[i].score1, game[i].score2, (game[i].score1>game[i].score2?1:2));
				j++;
			}
			i++;
		}
	  }
	  i = 0;

  return (
  <>
    <div>
      <h1 className="home-subtitle font-bold text-center text-1xl">
        Your Game History
      </h1>
      <div className="overflow-y-auto h-[24rem] ">
        {history.map((game, index) => (
          <div key={index} className="game-history">
            <Avatarmini id_user={game.Player1} />
            {game.score1} - {game.score2}
            <Avatarmini id_user={game.Player2} />
          </div>
        ))}
      </div>
    </div>
  </>
);
}



export default GameHistory;

