import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { authenticatedWrapper, getAuth } from "../../utils/auth/wrapper";
import { httpClient } from "../../utils/http-client";
import NavBar  from "../../components/menu&footer/navBar";
import Footer from "../../components/menu&footer/footer";
import ProgressBar from "../../components/user/progressBar";
import Head from "next/head";
import { useEffect, useRef, useState } from 'react';
import { getCookie } from "cookies-next";
import { io } from "socket.io-client";
import Avatar from "../../components/avatar/Avatar";
import Notifs from "../../components/notifications";

const User = ({ user, me, block}) => {

	const [loggedUsers, setLoggedUsers] = useState([]);
	const [notifs, setNotifs] = useState([]);
	const notifsRef = useRef(notifs);
    const socketRef = useRef();

    useEffect(() => {
		window.addEventListener('beforeunload', handleBeforeUnload);
		
      socketRef.current = io('http://localhost:3001/', { query: {
        authToken: getCookie('Auth'),
      }
      });

	  socketRef.current.on("get_loggedUsers", (data) => {
        setLoggedUsers(data);
      });

	  socketRef.current.on("youAreInvitedToPlay", (sender) => {
		setNotifs(notifs => [...notifs, sender]);
		});

	  socketRef.current.on("notifCanceled", (sender) => {
		setNotifs(prev => prev.filter(ntfs => ntfs.id != sender.id));
		});
  
    return () => {
		for (let value of notifsRef.current)
			socketRef.current.emit("gameInvitationDeclined", {waitingPlayer: value});
	  socketRef.current.off("get_loggedUsers");
	  socketRef.current.off("youAreInvitedToPlay");
	  socketRef.current.off("notifCanceled");
      socketRef.current.disconnect();
	  window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [])

  useEffect(() => {
	notifsRef.current = notifs;
	}, [notifs]);

	const handleBeforeUnload = () => {
		for (let value of notifsRef.current)
					socketRef.current.emit("gameInvitationDeclined", {waitingPlayer: value});
		setNotifs([]);
	}

	const [flag, setFlag] = useState(block.flag);

	const blockUser = async () => {
		const block = await httpClient.post("http://localhost:3001/user/blockUser", {blocked: user.id});
		setFlag(!flag);
	}

	const unblockUser = async () => {
		const block = await httpClient.post("http://localhost:3001/user/unblockUser", {blocked: user.id});
		setFlag(!flag);
	}

	const dislayBlockButton = () => {
		if (me.id != user.id) {
			if (flag) {
				return (
					<button onClick={unblockUser}>Unblock</button>
				)
			} else if (!flag){
				return (
					<button onClick={blockUser}>Block</button>
				)
			}
		}
	}

	useState(() =>{
	}, [flag]);

//   const level = user.xp/100;
  if (user) {
	return (
		<>
		<Head><title>Profile</title></Head>
		<NavBar/>
		<div className="page">
			<div className="w-1/2 mr-4 form-profile m-10">
				<div className="flex justify-center items-center">
						<Avatar id_user={user && user.id}/>
						<img className="avatar" src={user && user.avatar} alt="Avatar"></img>
				</div>
				<div className="home-subtitle flex justify-center items-center">
					{user && user.login}
				</div>
				<div className="home-text flex justify-center items-center">
					<h1>Email : {user && user.email}</h1>
				</div>
				<div className="home-text flex justify-center items-center">
					<h1>Level : {user.xp/100} </h1> 
				</div>
				<ProgressBar></ProgressBar>
				<div className="home-text flex justify-center items-center">
					{(user && user.gameWon>1) ? <h1>Games Won : {user && user.gameWon}</h1>: <h1>Game Won : {user && user.gameWon}</h1>}
				</div>
				<div className="home-text flex justify-center items-center">
					{(user && user.gameLost>1) ? <h1>Games Lost : {user && user.gameLost}</h1>: <h1>Game Lost : {user && user.gameLost}</h1>}
				</div>
				<div className="home-text flex justify-center items-center">
					{
						dislayBlockButton()
					}
				</div>
				<div className="home-text flex justify-center items-center">
					{loggedUsers.includes(user.id) ? <div className='w-12 h-12 bg-green-500 rounded-full'></div> : <div className='w-12 h-12 bg-red-500 rounded-full'></div>}
				</div>
			</div>
			<Footer/>
			{
				notifs.length > 0 && (
					<Notifs senders={notifs} setNotifs={setNotifs} socket={socketRef.current} user={user}/>
					)
			}
			</div>
		</>
	);
	}
	else {
		return (
			<div>NO SUCH USER</div>
		);
	}
};

export const getServerSideProps = authenticatedWrapper(
	async (context: GetServerSidePropsContext) => {
		const id : number = context.query.id;
		const Auth = getAuth(context);
		const user = await httpClient.get('http://backend_app:3001/user/getUserById/' + id ,{
		  headers: {
			Cookie: `Auth=${Auth}`,
		  },
		});
		const me = await httpClient.get(`${process.env.NEXT_PUBLIC_ME_ROUTE}`, {
			headers: {
			  Cookie: `Auth=${Auth}`,
			},
		});
		const block = await httpClient.get('http://backend_app:3001/user/getBlockByBothId/' + id ,{
			headers: {
			  Cookie: `Auth=${Auth}`,
			},
		});
		return {
		  props: {
			user: user.data,
			me: me.data,
			block: block.data
		}
		}
	}
  );


export default User;
