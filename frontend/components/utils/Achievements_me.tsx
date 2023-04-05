import { httpClient } from "../../utils/http-client";
import { useState, useEffect, Component} from 'react';
import Image from 'next/image'
import Alpine from 'alpinejs'

class gameHistory {
	Player1: number;
	Player2:number;
	score1:number;
	score2:number;
	hardcore:boolean;
	constructor(Player1: number, Player2: number, score1: number, score2: number, hardcore:boolean) {
    this.Player1 = Player1;
		this.Player2=Player2;
		this.score1=score1;
		this.score2=score2;
		this.hardcore=hardcore;
	}
}
// https://www.svgrepo.com/svg/421893/achievement-challenge-medal
const Achievement = () => {
  const [data, setData] = useState(null);
	const [id, setId] = useState(null);
	const [username, setUsername] = useState(null);
	const [xp, setXp] = useState(null);
	const [avatar, setAvatar] = useState(null);
  const [gameWon, setWon] = useState(null);
	const [strike, setStrike] = useState(false);
  
  const [P1, setP1] = useState(null);
	const [P2, setP2] = useState(null);
  const [game, setGame] = useState(null);
  const [mount, setMount] = useState(true);
  const [friend, setFriend] = useState(true);

  
  const [stk, setStk] = useState(0);
  const [cln, setCln] = useState(0);
  const [nb_hardcore, setNbHardcore] = useState(0);
  const [nb_frd, setFrd] = useState(0);
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    let mounted = true;
    
    httpClient.get("http://localhost:3001/user/me")
    .then((response) => {
      if (mounted) {
        setData(response.data)
        setId(response.data.id)
        setUsername(response.data.username)
        setXp(response.data.xp)
          setAvatar(response.data.avatar)
          setWon(response.data.gameWon)
        }
      })
      .then(() => httpClient.get("http://localhost:3001/game/history"))
      .then((response) => {
        if (mounted) {
          setGame(response.data)
          setP1(response.data.Player1)
          setP2(response.data.Player2)
        }
      })
    return () => {
      mounted = false;
    };
  }, []);
  
  const StartCheck = () => { 
    let history : gameHistory = [];
    let i : number = 0;
    let j : number = 0;
    
    let strike_nb : number = 0;
    let clean : number = 0;
    let nb_friend : number = 0;
    let nb_hc : number = 0;
    if (game) {
      while (i < game.length) {
        if (game[i].Player1 == id || game[i].Player2  == id) {
          history[j] = new gameHistory(game[i].Player1, game[i].Player2, game[i].score1, game[i].score2, game[i].hardcore);
        j++;
      }
      i++;
    }
    setFrd(j);
    i = 0;
    while (i < j) {
      if ((history[i].Player1 == id && history[i].score1 > history[i].score2) || (history[i].Player2 == id && history[i].score2 > history[i].score1))
      {
        strike_nb++;
        if (strike_nb == 5)
        {
          setStrike(true);
        }
        if (history[i].hardcore == true)
        {
          nb_hc++;
        }
      }
      else
      {
        strike_nb = 0;
      }
      if ((history[i].Player1 == id && history[i].score1 > history[i].score2 && (history[i].score2 == 0)) || (history[i].Player2 == id && history[i].score2 > history[i].score1 && (history[i].score1 == 0)))
      {
        clean++;
        
      }
      i++;
    }
    setCln(clean);
    setNbHardcore(nb_hc);
    setStk(strike_nb);
    setReady(true)
  }
};
  const Achieve_XP = () => {
    if (xp > 1000)
    {
      return (
        <Image className="text-rgb" src="/achieve_med.svg" width="60" height="60" alt="game"/>
        )
      }
      else
      {
        return (
          <div>
          <div className="flex">
            <Image style={{ width: 40, height: 40 }} className="text-rgb opacity-25" src="/achieve_med.svg" width="40" height="40" alt="game"/>
            <h3>Lvl 10</h3>
          </div>
          <progress className="progressbar-wrapper-home progressbar-home" max="1000" value={data && data.xp}></progress>
        </div>
      )
    }
  }
  
  const Achieve_Win = () => {
    if (gameWon >= 40)
    {
      return (
        <Image className="text-rgb mt-4 mb-4" src="/achieve_cup.svg" width="60" height="60" alt="game"/>
        )
      }
      else
      {
        return (
          <div>
          <div className="flex">
            <Image style={{ width: 40, height: 40 }} className="text-rgb opacity-25" src="/achieve_cup.svg" width="40" height="40" alt="game"/>
            <h3>Win 40 games</h3>
          </div>
          <progress className="progressbar-wrapper-home progressbar-home" max="40" aria-valuenow={gameWon} value={gameWon%100}></progress>
        </div>
      )
    }
  }

  const Achieve_arc = () => {
    if (cln >= 5)
    {
      return (
        <Image className="text-rgb mb-8" src="/achieve_arc.svg" width="60" height="60" alt="game"/>
        )
      }
      else
      {
        return (
          <div>
          <div className="flex">
            <Image style={{ width: 40, height: 40 }} className="text-rgb opacity-25" src="/achieve_arc.svg" width="40" height="40" alt="game"/>
            <h3>Win a 5 cleansheet game</h3>
          </div>
          <progress className="progressbar-wrapper-home progressbar-home" max="5" value={cln}></progress>
        </div>
      )
    }
  }
  
  const Achieve_strike = () => {
    if (strike ==true)
    {
      return (
        <Image className="text-rgb" src="/achieve_strike.svg" width="60" height="60" alt="game"/>
        )
      }
      else
      {
        return (
          <div>
          <div className="flex">
            <Image style={{ width: 40, height: 40 }} className="text-rgb opacity-25" src="/achieve_strike.svg" width="40" height="40" alt="game"/>
            <h3>5 win strike</h3>
          </div>
          <progress className="progressbar-wrapper-home progressbar-home" max="5" value={stk}></progress>
        </div>
      )
    }
  }

  const Achieve_hc = () => {
    if (nb_hardcore >= 10)
    {
      return (
        <Image style={{ width: 40, height: 40 }} className="text-rgb mt-4 mb-4" src="/achieve_hc.svg" width="60" height="60" alt="game"/>
        )
      }
      else
      {
        return (
          <div>
          <div className="flex">
            <Image style={{ width: 40, height: 40 }} className="text-rgb opacity-25" src="/achieve_hc.svg" width="40" height="40" alt="game"/>
            <h3>Win 10 games in hardcore mode</h3>
          </div>
          <progress className="progressbar-wrapper-home progressbar-home" max="10" value={nb_hardcore}></progress>
        </div>
      )
    }
  }
  useEffect(()=>{
    StartCheck()

  }, [game, ready])
  const Achieve_friend = () => {
  
    if (nb_frd > 10)
    {
      return (
        <Image className="text-rgb mb-6" src="/achieve_friend.svg" width="60" height="60" alt="game"/>
        )
      }
      else
      {
        return (
          <div>
        <div className="flex">
          <Image style={{ width: 40, height: 40 }} className="text-rgb opacity-25" src="/achieve_friend.svg" width="40" height="40" alt="game"/>
          <h3>Play 10 games</h3>
        </div>
        <progress className="progressbar-wrapper-home progressbar-home" max="10" value={nb_frd}></progress>
      </div>
      )
    }
  }



  return (
    <>
    <div className="container mx-auto" id="Start_Check">
      <h3 className="home-subtitle text-center text-1xl">
        Achievements
      </h3>
      <div className="overflow-y-auto overflow-x-auto h-[18rem] md:grid md:grid-cols-2 md:gap-4 font-mono text-color-5">
        <ul className="gap-6">
          <li>
           <Achieve_friend/>
            <Achieve_Win/>
            <Achieve_XP/>
          </li>
        </ul>
        <ul className="gap-6">
          <li>
            <Achieve_arc/>
            <Achieve_hc/>
            <Achieve_strike/>
          </li>
        </ul>
      </div>
    </div>
  </>
  )
}

export const getStaticProps = false;
export default Achievement;