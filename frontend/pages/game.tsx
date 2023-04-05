import Link from "next/link";
import React, { useState , useEffect, useRef} from 'react';
import NavBar from "../components/menu&footer/navBar";
import Footer from "../components/menu&footer/footer";
import { io, Socket } from "socket.io-client";
import { getCookie } from 'cookies-next';
import { authenticatedWrapper, getAuth } from "../utils/auth/wrapper";
import { GetServerSidePropsContext } from "next";
import { httpClient } from "../utils/http-client";
import Head from "next/head";
import StatsPlayer from "../components/user/statsPlayer";
import * as KeyCode from 'keycode-js'
import keyCodeToCodes from 'keycode-to-codes';
import { motion } from "framer-motion"
import Image from 'next/image'
import Canvas from "../components/game/Canvas";
import Notifs from "../components/notifications";
import AvatarMini from "../components/avatar/Avatarmini";
import WaitingFriend from '../components/game/waitingFriend';
import { useRouter } from 'next/router'

const game = ({user}) => {
	const [matchState, setMatchState] = useState("");
	
	const [friendsList, setFriendsList] = useState([]);
	const [loggedUsers, setLoggedUsers] = useState([]);
	const [inGameUsers, setInGameUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
	const [notifs, setNotifs] = useState([]);
	
	const friendWaitingFor = useRef(null);
	const notifsRef = useRef(notifs);
	const hardcoreRef = useRef(false);

	const player = useRef();
	const opponent = useRef();
  var ball = useRef();
	const socketRef = useRef();
  const roomId = useRef();

  const [hardcore, setHardcore] = useState(false);

  const [keyCode, setKeyCode] = useState("");
  const [opponentId, setOpponentId] = useState("");

  const [positionPlayer, setPositionPlayer] = useState("");
  const [positionOpponent, setPositionOpponent] = useState("");
  const [position, setPosition] = useState(5);
  const [gameRoomId, setGameRoomId] = useState("");
  const [opt_game, setOpt] = useState(true);
  const [Global_Room, setGl_Room] = useState();
  const [showRoom, setRoom] = useState(false);
  const [specRoom, setSpecRoom] = useState(false);
  const [viewGame, setViewGame] = useState(false);
  const [viewMatch, setViewMatch] = useState(false);
  const [usersGame, setUsersGame] = useState();
  const [gameRoom, setGameRoom] = useState();
  const [alreadyLogged, setLogged] = useState(false)

  const router = useRouter();


  const handleOption = (Option: boolean, Room: boolean, Spec: boolean, Game: boolean) =>
  {
    setOpt(Option);
    setRoom(Room);
    setSpecRoom(Spec);
    setViewGame(Game);
  }
  
  const GameSolo = () => {
    socketRef.current.emit('matchmaking', {id: user.id});
    handleOption(true, false, false, false);
    setViewMatch(true);
  }

  const GameSoloHardcore = () => {
	setHardcore(true);
    socketRef.current.emit('matchmakingHardcore', {id: user.id});
    handleOption(true, false, false, false);
    setViewMatch(true);
  }

  const WaitingRoomMatching = () => {
    if (matchState == "cancel")
    {
	  friendWaitingFor.current = null;
      setViewMatch(false);
      handleOption(true, false, false, false);
      setMatchState("");
    }
    else
    {
      return(
	  		<WaitingFriend friendWaitingFor={friendWaitingFor} socket={socketRef.current} user={user} setMatchState={setMatchState} hardcore={hardcore} setHardcore={setHardcore}/>
	  )
    }
  }

  const LeaveGame = () => {
    socketRef.current.emit('leaveGame', {id: user.id, roomId: roomId.current})
    handleOption(true, false, false, false);
    setMatchState("");
  }

  const joinSpecRoom = async () => {
    handleOption(false, false, true, false);
  }

  const handleLeaveGame = () => {
    if (matchState == "giveup")
    {
      setMatchState("")
      handleOption(true, false, false, false)
    }
    else
    {
      return (
        <button className="btn-play text-color-3" onClick={() => {LeaveGame()}}>
          leave game
        </button>
      )
    }
  }

  const inviteInGame = (invitedUser) => {
	for (const index of notifs.values()) {
		if (index.id == invitedUser.id) {
			setNotifs(prev => prev.filter(sender => sender != invitedUser));
			socketRef.current.emit("launchGameWithFriend", {player1: invitedUser, player2: user});
			for (const index of notifs.values())
		 	 	socketRef.current.emit("gameInvitationDeclined", {waitingPlayer: index});
			setNotifs([]);
			return ;
		}
	}
	socketRef.current.emit("inviteNotif", {id: invitedUser.id, sender: user});
	setMatchState("");
	setViewMatch(true);
	handleOption(true, false, false, false);
	friendWaitingFor.current = invitedUser;
  }


	useEffect(() =>{
		window.addEventListener('beforeunload', handleBeforeUnload);

		socketRef.current = io('http://localhost:3001/', { query: {
			authToken: getCookie('Auth'),
		  }
		});

    socketRef.current.on("alreadyLogged", (data) =>{
      router.push('/home');
    });

		socketRef.current.on("match", (data) => {
			if (friendWaitingFor.current)
	  			socketRef.current.emit('cancelNotif', {id: friendWaitingFor.current.id, sender: user});
	  		if (notifsRef.current.length > 0) {
		  		for (const index of notifsRef.current)
		  			socketRef.current.emit("gameInvitationDeclined", {waitingPlayer: index});
		 		setNotifs([]);
	  		}
	 		friendWaitingFor.current = null;
      		setViewMatch(false);
      		handleOption(false, false, false, true);
      		setMatchState("");
     	 	roomId.current = data.roomId;
			player.current = data.me;
			opponent.current = data.opponent;
      		ball.current = data.ball;
		});
		socketRef.current.on("cancel", () => {setMatchState("cancel")});
		socketRef.current.on("giveUp", () => {setMatchState("giveup")});

		const friendsList = async () => {
			const list = await httpClient.get("http://localhost:3001/relationnal/getFriends");
			setFriendsList(list.data);
		  }
		friendsList();

		socketRef.current.on("get_loggedUsers", (data) => {
			setLoggedUsers(data);
		  });

		socketRef.current.on("get_inGameUsers", (data) => {
      setInGameUsers(data.users);
      setRooms(data.room);
		});
			
		socketRef.current.emit("askingInGameUsers");
		
		socketRef.current.on("youAreInGame", (data) => {
			roomId.current = data.room;
			if (data.player1.id == user.id) {
				player.current = data.player1;
				opponent.current = data.player2;
				ball.current = data.ball1;
			}
			else {
				player.current = data.player2;
				opponent.current = data.player1;
				ball.current = data.ball2;
			}
			setViewMatch(false);
     		handleOption(false, false, false, true);
      		setMatchState("");
		})

		socketRef.current.on("youAreInvitedToPlay", (sender) => {
			setNotifs(notifs => [...notifs, sender]);
		});

		socketRef.current.on("notifCanceled", (sender) => {
			setNotifs(prev => prev.filter(ntfs => ntfs.id != sender.id));
		});

    socketRef.current.on("getAllGame", (data) => {
			setUsersGame(data.users);
     		setGameRoom(data.rooms);
		});

    socketRef.current.emit("getAllGame");

		return () => {
				for (let value of notifsRef.current)
					socketRef.current.emit("gameInvitationDeclined", {waitingPlayer: value});
				socketRef.current.disconnect();
				socketRef.current.off("cancel");
				socketRef.current.off("getOpponentPos");
				socketRef.current.off("getBallPosition");
				socketRef.current.off("match");
				socketRef.current.off("giveUp");
				socketRef.current.off("get_loggedUsers");
				socketRef.current.off("get_inGameUsers");
				socketRef.current.off("notifCanceled");
				window.removeEventListener('beforeunload', handleBeforeUnload);
			}
	}, [])

	useEffect(() => {
		notifsRef.current = notifs;
	}, [notifs]);

	const handleBeforeUnload = () => {
		if (friendWaitingFor.current)
	  		socketRef.current.emit('cancelNotif', {id: friendWaitingFor.current.id, sender: user});
		for (let value of notifsRef.current)
			socketRef.current.emit("gameInvitationDeclined", {waitingPlayer: value});
		setNotifs([]);
	}

	const friendsTab = (fuser, index) => {
		if (!loggedUsers.includes(fuser.id)) {
			return (<>
        <div key={index} className="flex justify-center items-center">
          <AvatarMini id_user={fuser.id}/>
          <p className="ml-4" key={index}>{fuser.username} </p>
          <div title="offline" className='ml-1 w-3.5 h-3.5 bg-red-500 rounded-full'/>
        </div>
        <div>
          <button className="btn-invite-offline cursor-default">
            <span className="ml-3 mr-3 text-gray-300">
            Invite
            </span>
          </button>
        </div>
			</>)
		}
		else if (inGameUsers.includes(fuser.id)) {
      const room = rooms[inGameUsers.indexOf(fuser.id)];
			return (<>
                <div key={index} className="flex justify-center items-center">
                  <AvatarMini id_user={fuser.id}/>
                  <p className="ml-4" key={index}>{fuser.username} </p>
				  <div title="in game" className='ml-1 w-3.5 h-3.5 bg-orange-500 rounded-full'/>
                </div>
				<div>
				<motion.div whileHover={{ scale: [null, 1.1, 1.1] }} transition={{ duration: 0.3 }}>
          <button className="btn-invite">
            <Link href={`/spectate?roomId=${room}`}>
              <span className="ml-3 mr-3 text-white">
                Spectate
              </span>
            </Link>
          </button>
        </motion.div>
				</div>
			</>
      )
		}
		else {
			return (<>
                <div key={index} className="flex justify-center items-center">
                  <AvatarMini id_user={fuser.id}/>
                  <p className="ml-4" key={index}>{fuser.username} </p>
				  <div title="online" className='ml-1 w-3.5 h-3.5 bg-green-500 rounded-full'/>
        </div>
				<div>
          <motion.div whileHover={{ scale: [null, 1.1, 1.1] }} transition={{ duration: 0.3 }}>
            <button className="btn-invite" onClick={() => {inviteInGame(fuser)}}>
              <span className="ml-3 mr-3 text-white">
                Invite
              </span>
            </button>
          </motion.div>
				</div>
			</>
      )
		}
	}

  if (alreadyLogged){
    return (
      <>Already Logged</>
    )
  }else {

    return (
      <>
       {
            viewMatch && (
            WaitingRoomMatching(viewMatch)
              )
        }
        <Head><title>Setting Game</title></Head>
      <NavBar/>
        <div className="page">
          <div className="container mx-auto py-8">
            <div className=" mx-auto form-game overflow-y-auto">
          {
            opt_game && (
              <div className="min-w-full lg:grid lg:grid-cols-2 rounded border">
                <div className="flex flex-col items-center md:border-r border-t">
          <h2 className="my-2 mb-2 text-xl font-bold mb-8 text-color-2">Play with friends</h2>
          {
                  friendsList && friendsList.map((fuser, index) =>
          <div key={index}>{friendsTab(fuser, index)}</div>
                  )
                 }
                 <motion.div
                  whileHover={{ scale: [null, 1.3, 1.2] }}
                  transition={{ duration: 0.3 }}>
                    <button className="btn-home mb-6 mt-6" onClick={() => {
                        joinSpecRoom();
                      }}>
                      <span className="ml-2 mr-2 home-subtitle">
                        Spectator
                      </span>
                    </button>
                  </motion.div>
                </div>
                <div className="flex flex-col items-center border-t">
                  <h2 className="my-2 mb-2 text-xl font-bold mb-8 text-color-2">Play solo</h2>
                  <StatsPlayer/>
                  <motion.div
                    whileHover={{ scale: [null, 1.3, 1.2] }}
                    transition={{ duration: 0.3 }}>
                    <button className="btn-home mb-6" onClick={() => {GameSolo()}}>
                      <span className="ml-2 mr-2 home-subtitle">
                        Launch game
                      </span>
                    </button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: [null, 1.3, 1.2] }}
                    transition={{ duration: 0.3 }}>
                    <button className="btn-home mb-6" onClick={() => {GameSoloHardcore()}}>
                      <span className="ml-2 mr-2 home-subtitle">
                        Launch hardcore game
                      </span>
                    </button>
                  </motion.div>
                </div>
              </div>
            )
          }
          {
            showRoom && (
              <div className="min-w-full flex justify-center items-center">
                <div className="">
                  <h3 className="my-2 mb-2 ml-2 text-xl font-bold mb-8 text-color-2">
                    Join a Room
                  </h3>
                </div>
                <div className="ml-10 mb-4">
                  <button className="flex justify-end items-center" onClick={() => {handleOption(true, false, false, false)}}>
                    <Image src="/close.svg" width="30" height="30" alt="close"/>
                  </button>
                </div>
              </div>
            )
          }
          {
            specRoom && (
              <div className="min-w-full flex justify-center items-center flex-col">
                <div className="flex items-center">
                  <div className="ml-10">
                    <h3 className="my-2 mb-2 ml-2 text-xl font-bold mb-8 text-color-2">
                      Spectator Room
                    </h3>
                  </div>
                  <div className="mb-6 ml-8">
                    <button className="flex justify-end items-center" onClick={() => {handleOption(true, false, false, false)}}>
                      <Image src="/close.svg" width="30" height="30" alt="close"/>
                    </button>
                  </div>
                </div>
                <div className="flex justify-center items-center">
                  <ul className="">
                    {
                      usersGame && usersGame.map((fuser, index)=> {
                        const room = gameRoom[index];
                        return (
                          <li key={index}>
                            <div className="flex justify-center items-center">
                              <AvatarMini id_user={fuser.id}/>
                              <p className="ml-4" key={index}>{fuser.username} </p>
                              <div title="in game" className='ml-1 w-3.5 h-3.5 bg-orange-500 rounded-full'/>
                              <div>
                                <motion.div whileHover={{ scale: [null, 1.1, 1.1] }} transition={{ duration: 0.3 }}>
                                  <button className="btn-invite">
                                    <Link href={`/spectate?roomId=${room}`}>
                                      <span className="ml-3 mr-3 text-white">
                                        spectate
                                      </span>
                                    </Link>
                                  </button>
                                </motion.div>
                              </div>
                            </div>
                          </li>
                        )
                      })
                    }
                  </ul>
                </div>
              </div>
            )
          }
          </div>
          {
            viewGame && (
              <div className="py-6 items-center grid">
                <div className="">
                  {
                    handleLeaveGame()
                  }
                  <Canvas user={user} socket={socketRef.current} player={player.current} opponent={opponent.current} roomId={roomId.current} ball={ball.current}/>
                </div>
              </div>
            )
          }
        </div>
        <Footer/>
        </div>
      {
      notifs.length > 0 && (
        <Notifs senders={notifs} setNotifs={setNotifs} socket={socketRef.current} user={user}/>
      )
      }
      </>
    );
  }
};

  
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

  export default game;
