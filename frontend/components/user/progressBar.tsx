import { httpClient } from "../../utils/http-client";
import { useState, useEffect} from 'react';

const ProgressBar = () => {
	const [data, setData] = useState(null);
	const [id, setId] = useState(null);
	const [xp, setXp] = useState(null);
	useEffect(() => {
		httpClient.get("http://localhost:3001/user/me")
		.then((response) => {
			setData(response.data)
			setId(response.data.id)
			setXp(response.data.xp)
		  })
	  }, [])
    return (
        <>
		<div>
			<progress className="progressbar-wrapper progressbar" max="100" value={data && data.xp%100}></progress>
		</div>
        </>
    )
}

export default ProgressBar;

