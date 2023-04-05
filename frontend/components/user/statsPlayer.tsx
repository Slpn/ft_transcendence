import { httpClient } from "../../utils/http-client";
import { useState, useEffect} from 'react'
import ProgressBarHome from "./progressBarHome";

const StatsPlayer = () => {
	const [data, setData] = useState(null);
	const [id, setId] = useState(null);
	const [username, setUsername] = useState(null);
	const [xp, setXp] = useState(null);
	const [gameWon, setWon] = useState(null);
	const [gameLost, setLost] = useState(null);
	useEffect(() => {
		httpClient.get("http://localhost:3001/user/me")
		.then((response) => {
			setData(response.data)
			setId(response.data.id)
			setUsername(response.data.username)
			setXp(response.data.xp)
			setWon(response.data.gameWon)
			setLost(response.data.gameLost)
		  })
	  }, [])
	return (
		<>
			<div className="home-subtitle text-center text-1xl">
				Your Stats
			</div>
			<div className="home-text text-center font-mono">
				Login : {data && data.login}
				<br></br>
				Level : {data && data.xp/100}
				<ProgressBarHome/>
				{(data && data.gameWon>1) ? <h1>Games Won : {data && data.gameWon}</h1>: <h1>Game Won : {data && data.gameWon}</h1>}
				{(data && data.gameLost>1) ? <h1>Games Lost : {data && data.gameLost}</h1>: <h1>Game Lost : {data && data.gameLost}</h1>}
			</div>
		</>
	)
}

export default StatsPlayer;

