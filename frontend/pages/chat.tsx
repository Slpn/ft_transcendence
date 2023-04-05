import React, { SyntheticEvent, useEffect, useRef, useState} from 'react';
import NavBar from "../components/menu&footer/navBar";
import Footer from "../components/menu&footer/footer";
import AddChannel from "../components/chat/AddChannel";
import Owner from "../components/chat/Owner";
import { GetServerSidePropsContext } from "next";
import { httpClient } from "../utils/http-client";
import { io } from "socket.io-client";
import { authenticatedWrapper, getAuth } from "../utils/auth/wrapper";
import { getCookie } from 'cookies-next'
import Link from 'next/link';
import Image from 'next/image'
import Notifs from "../components/notifications";
import { useRouter } from "next/router";
import WaitingFriend from '../components/game/waitingFriend';
// import { render } from "react-dom";
                                                                                                                                                                    
  const Chat = ({ user, friends }) => {

	const router = useRouter();

    const [message, setMessage] = useState("");
    // const [channelList, setChannelList] = useState();
    const [publicChannels, setPublicChannels] = useState();
    const [privateChannels, setPrivateChannels] = useState();
    const [protectedChannels, setProtectedChannels] = useState();

    const [privateMessage, setPrivateMessage] = useState([]);
    const [userId, setUserId] = useState(0);

    const [channelId, setChannelId] = useState(0);
    const [channelData, setChannelData] = useState("");

    const [loggedUsers, setLoggedUsers] = useState([]);

    const [channelUsers, setChannelUsers] = useState();
    const [connectedUser, setConnectedUsers] = useState();
    const [channelBanList, setBanList] = useState();
    const [channelOwner, setOwner] = useState();
    const [channelAdmins, setAdmins] = useState([0]);
    const [channelMessage, setChannelMessage] = useState([]);

    const [socketPrivateMessageTmp, setSocketPrivateMessage] = useState([]);
    const [socketMessageTmp, setSocketMessage] = useState([]);

    const [renderConnectedUsers, setRenderConnectedUsers] = useState(true);
    const [renderChannelList, setRenderChannelList] = useState(true);
    const [renderBanList, setRenderBanList] = useState(true);
    const [renderAdminList, setRenderAdminList] = useState(0);

    const [friend, setFriend] = useState();

    const socketRef = useRef();
    const socketMessage = useRef([]);
    const socketPrivateMessage = useRef([]);

	const [inGameUsers, setInGameUsers] = useState([]);
	const [notifs, setNotifs] = useState([]);
	const [waiting, setWaiting] = useState(false);
	const notifsRef = useRef(notifs);
	const FriendWaitingFor = useRef(null);

    useEffect(() => {
		window.addEventListener('beforeunload', handleBeforeUnload);

      socketRef.current = io('http://localhost:3001/', { query: {
        authToken: getCookie('Auth'),
      }
      });

      socketRef.current.on("new_message", (data) => {
        socketMessage.current.push(data);
        setSocketMessage([...socketMessage.current]);
      });

	  socketRef.current.on("match", () => {
		router.push('/game');
	  });

      socketRef.current.on("get_loggedUsers", (data) => {
        setLoggedUsers(data);
      });

      socketRef.current.on("new_private_message", (data) => {
        socketPrivateMessage.current.push(data);
          setSocketPrivateMessage([...socketPrivateMessage.current]);
      });


      socketRef.current.on("get_connected_users", (data) => {
      setConnectedUsers(data.users);
    });

    socketRef.current.on("get_banned", () => {
      setChannelData("");
      setChannelMessage([]);
      setConnectedUsers(undefined);
      setChannelId(0);
    });

    socketRef.current.on("get_kicked", () => {
      setChannelData("");
      setChannelMessage([]);
      setConnectedUsers(undefined);
      setChannelId(0);
    });

    socketRef.current.on("get_promoted", async (data) => {
      const admins = await httpClient.get("http://localhost:3001/channel/getChannelAdmins/" + channelId);
      setAdmins(admins.data);
    });

    socketRef.current.on("get_demoted", async (data) => {
      const admins = await httpClient.get("http://localhost:3001/channel/getChannelAdmins/" + channelId);
      setAdmins(admins.data);
    });

	socketRef.current.on("youAreInvitedToPlay", (sender) => {
		setNotifs(notifs => [...notifs, sender]);
	});

	socketRef.current.on("notifCanceled", (sender) => {
		setNotifs(prev => prev.filter(ntfs => ntfs.id != sender.id));
	});

	socketRef.current.on("gameAccepted", () => {
		router.push('/game');
	})

	socketRef.current.on("cancel", () => {
		setWaiting(false);
		FriendWaitingFor.current = null;
	});

	socketRef.current.on("get_inGameUsers", (data) => {
		setInGameUsers(data.users);
	  });
	  
  	socketRef.current.emit("askingInGameUsers");

    return () => {
		for (let value of notifsRef.current)
			socketRef.current.emit("gameInvitationDeclined", {waitingPlayer: value});
      socketRef.current.off("new_message");
      socketRef.current.off("new_private_message");
      socketRef.current.off("get_connected_users");
      socketRef.current.off("get_banned");
      socketRef.current.off("get_unbanned");
      socketRef.current.off("get_promoted");
      socketRef.current.off("get_demoted");
      socketRef.current.off("youAreInvitedToPlay");
      socketRef.current.off("notifCanceled");
      socketRef.current.off("cancel");
	  socketRef.current.off("get_inGameUsers");
      socketRef.current.disconnect();
	  window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [])
  
  useEffect(() => {
	notifsRef.current = notifs;
	}, [notifs]);

	const handleBeforeUnload = () => {
		if (FriendWaitingFor.current)
	  		socketRef.current.emit('cancelNotif', {id: FriendWaitingFor.current.id, sender: user});
		for (let value of notifsRef.current)
					socketRef.current.emit("gameInvitationDeclined", {waitingPlayer: value});
		setNotifs([]);
	}

  useEffect(() => {
    const getChannelsById = async () => {
        if (channelId != 0) {
          const checkBan = await httpClient.get("http://localhost:3001/channel/checkUnbanUser/" + channelId);
          if (checkBan.data.message == true) {
            const channel = await httpClient.get("http://localhost:3001/channel/getChannel/" + channelId);
            const messages = await httpClient.get("http://localhost:3001/message/getAllMessageByChannelId/" + channelId);
            const owner = await httpClient.get("http://localhost:3001/channel/getChannelOwner/" + channelId);
            const admins = await httpClient.get("http://localhost:3001/channel/getChannelAdmins/" + channelId);
            const bannedUsers = await httpClient.get("http://localhost:3001/channel/getBannedUsers/" + channelId);
            setChannelData(channel.data);
            setChannelMessage(messages.data.messages);
            setChannelUsers(messages.data.userslist);
            setOwner(owner.data);
            setAdmins(admins.data);
            setBanList(bannedUsers.data);
            setUserId(0);
            setSocketMessage([]);
            socketMessage.current = [];
            await socketRef.current.emit('get_connected_users', {channel: channel.data});
            await socketRef.current.emit('join_channel', {user_id: user.id, channel: channel.data});
          }
          else {
            alert("Banned from this channel");
          }
        }
      }
      getChannelsById();
    }, [channelId, user]);

    useEffect(() => {
      const getPrivateRoomById = async () => {
        if (userId != 0) {
          const friend = await httpClient.get("http://localhost:3001/user/getUserById/" + userId);
          const messages = await httpClient.get("http://localhost:3001/message/getPrivateMessage/" + user.id + "/" + userId);
          setPrivateMessage(messages.data);
          setFriend(friend.data);
          setChannelId(0);
          setSocketPrivateMessage([]);
          socketPrivateMessage.current = [];
          await socketRef.current.emit('join_friend_room', {user_id: user.id, friend: friend.data.id});
        }
      }
      getPrivateRoomById();
    }, [userId]);

    useEffect(() => {
      const fetchConnectedUsers = async () => {
        const bannedUsers = await httpClient.get("http://localhost:3001/channel/getBannedUsers/" + channelId);
        setBanList(bannedUsers.data);
      }
      fetchConnectedUsers();
    }, [renderConnectedUsers, channelId])

    useEffect(() => {
      const fetchChannel = async () =>{
        const private_channels = await  httpClient.get("http://localhost:3001/channel/getPrivateChannels");
        const public_channels = await  httpClient.get("http://localhost:3001/channel/getPublicChannels");
        const protected_channels = await  httpClient.get("http://localhost:3001/channel/getProtectedChannels");
        setPrivateChannels(private_channels.data);
        setPublicChannels(public_channels.data);
        setProtectedChannels(protected_channels.data);
      }
      fetchChannel();
    }, [renderChannelList])

    useEffect(() => {
      const fetchBanned = async () =>{
        if (channelId){
          const bannedUsers = await httpClient.get("http://localhost:3001/channel/getBannedUsers/" + channelId);
          setBanList(bannedUsers.data);
        }
      }
      fetchBanned();
    }, [renderBanList, channelId])

    useEffect(() => {
      const fetchAdmin = async () =>{
        if (channelId){
          const admins = await httpClient.get("http://localhost:3001/channel/getChannelAdmins/" + channelId);
          setAdmins(admins.data);
        }
      }
      fetchAdmin();
    }, [renderAdminList, channelId])

    const muteUser = async (id: number) => {
      const mute = await httpClient.post("http://localhost:3001/channel/muteUser", {user_id: id, channel_id: channelId});
    }

    const promoteToAdmin  = async (id: number) => {
      const admins = await httpClient.get("http://localhost:3001/channel/getChannelAdmins/" + channelId);
      await httpClient.post("http://localhost:3001/channel/promoteToAdmin", {user_id: id, channel_id: channelId});
      socketRef.current.emit("promote_to_admin", {user_id: id, channel: channelData});
      setRenderAdminList(!renderAdminList);
    }

    const demoteToUser  = async (id: number) => {
      await httpClient.post("http://localhost:3001/channel/demoteToUser", {user_id: id, channel_id: channelId});
      socketRef.current.emit("demote_to_user", {user_id: id});
      setRenderAdminList(!renderAdminList);
    }

    const kickUser = async (id: number) => {
      await socketRef.current.emit("kick_from_channel", {user_id: id, channel_id: channelId});
    }

    const banUser = async (id: number) => {
      await socketRef.current.emit("ban_from_channel", {user_id: id, channel_id: channelId});
      const bannedUsers = await httpClient.get("http://localhost:3001/channel/getBannedUsers/" + channelId);
      setBanList(bannedUsers.data);
      setRenderBanList(!renderBanList);
    }

    const unbanUser = async (id: number) => {
      await httpClient.post("http://localhost:3001/channel/unbanUser", {user_id: id, channel_id: channelId});
      await socketRef.current.emit("unban_from_channel", {user_id: id, channel_id: channelId});
      setRenderBanList(!renderBanList);
    }

	const displayState = (id: number) => {
		if (inGameUsers.includes(id)) {
			return (
				<div className='rounded-full bg-orange-500 px-1'></div>
			)
		}
		else {
			return (
				<div className='rounded-full bg-green-500 px-1'></div>
			)
		}
	}

    const leaveChannel = async () => {
      await socketRef.current.emit("leave_channel", {user_id: user.id, channel_id: channelId});
      setChannelData("");
      setChannelMessage([]);
      setConnectedUsers(undefined);
      setChannelId(0);
    }

    const checkProtected = async (channel_id: number) => {
      const ban = await httpClient.get("http://localhost:3001/channel/getBanByUserAndChannel/" + channel_id);
      if (ban.data) {
        alert("You are ban from this channel")
        return ;
      }

      const password = window.prompt("Enter Password");
      if (!password){
        return ;
      }

      const check = await httpClient.post("http://localhost:3001/channel/checkPassword", {channel_id: channel_id, password: password});
      if (check.data.message == "success") {
        setChannelId(channel_id);
      }
    }

    const displaySocketMessage = () => {
      if (userId == 0 && channelId) {
        return (
          socketMessageTmp.map((element, index) => {
            if ( (element.user) && user.id != element.user.id) {
              return (
                <li key={index} className="flex justify-start">
                  {loggedUsers.includes(element.user.id) ? displayState(element.user.id) : <div className='rounded-full bg-red-500 px-1'></div>}
                  <div className="relative max-w-xl px-4 py-2 text-gray-700 rounded shadow">
                    <Link href={`/user/user?id=${element.user.id}`}>
                      <span className="block break-words font-bold">{element.user.username}</span>
                    </Link>
                    <span className="block break-words">{element.message}</span>
                  </div>
                </li>
              )
            } else {
              return (
                <li key={index} className="flex justify-end">
                  {loggedUsers.includes(user.id) ? displayState(user.id)  : <div className='rounded-full bg-red-500 px-1'></div>}
                  <div className="relative max-w-xl px-4 py-2 text-gray-700 bg-gray-100 rounded shadow">
                    <Link href={`/user/user?id=${user.id}`}>
                      <span className="block break-words font-bold">{user.username}</span>
                    </Link>
                    <span className="block break-words">{element.message}</span>
                  </div>
                </li>
              )
            }
          })
        );
      } else if (userId && channelId == 0) {
        return (
          socketPrivateMessageTmp.map((element, index) => {
              if ( (element) && user.id != element.user.id) {
                return (
                  <li key={index} className="flex justify-start">
                    {loggedUsers.includes(element.user.id) ? displayState(element.user.id)  : <div className='rounded-full bg-red-500 px-1'></div>}
                    <div className="relative max-w-xl px-4 py-2 text-gray-700 rounded shadow">
                      <Link href={`/user/user?id=${element.user.id}`}>
                        <span className="block break-words font-bold">{element.user.username}</span>
                      </Link>
                      <span className="block break-words">{element.message}</span>
                  </div>
                  </li>
                )
              } else {
                return (
                  <li key={index} className="flex justify-end">
                    {loggedUsers.includes(element.user.id) ? displayState(element.user.id)  : <div className='rounded-full bg-red-500 px-1'></div>}
                    <div className="relative max-w-xl px-4 py-2 text-gray-700 bg-gray-100 rounded shadow">
                    <Link href={`/user/user?id=${user.id}`}>
                     <span className="block break-words font-bold">{user.username}</span>
                     </Link>
                      <span className="block break-words">{element.message}</span>
                    </div>
                  </li>
                )
              }
            })
        );
      }
    }

    const displayMessage = () => {
      if (userId == 0 && channelId) {
        return (
          channelMessage.map((element, index) => {
            const other = channelUsers[index];
            if ( (element) && user.id != element.sender) {
              return (
                <li key={index} className="flex justify-start">
                  {loggedUsers.includes(element.sender) ? displayState(element.sender)  : <div className='rounded-full bg-red-500 px-1'></div>}
                  <div className="relative max-w-xl px-4 py-2 text-gray-700 rounded shadow">
                    <Link href={`/user/user?id=${element.sender}`}>
                      <span className="block break-words font-bold">{other.username}</span>
                    </Link>
                    <span className="block break-words">{element.contents}</span>
                </div>
                </li>
              )
            } else {
              return (
                <li key={index} className="flex justify-end">
                  {loggedUsers.includes(element.sender) ? displayState(element.sender)  : <div className='rounded-full bg-red-500 px-1'></div>}
                  <div className="relative max-w-xl px-4 py-2 text-gray-700 bg-gray-100 rounded shadow">
                  <Link href={`/user/user?id=${user.id}`}>
                    <span className="block break-words font-bold">{user.username}</span>
                    </Link>
                    <span className="block break-words">{element.contents}</span>
                  </div>
                </li>
              )
            }
          })
        );
      }
      else if (userId && channelId == 0) {
        return (
          privateMessage.map((element, index) => {
              if ( (element) && user.id != element.sender) {
                return (
                  <li key={index} className="flex justify-start">
                    {loggedUsers.includes(element.sender) ? displayState(element.sender) : <div className='rounded-full bg-red-500 px-1'></div>}
                    <div className="relative max-w-xl px-4 py-2 text-gray-700 rounded shadow">
                      <Link href={`/user/user?id=${friend.id}`}>
                      <span className="block break-words font-bold">{friend.username}</span>
                      </Link>
                      <span className="block break-words">{element.content}</span>
                  </div>
                  </li>
                )
              } else {
                return (
                  <li key={index} className="flex justify-end">
                    {loggedUsers.includes(element.sender) ? displayState(element.sender)  : <div className='rounded-full bg-red-500 px-1'></div>}
                    <div className="relative max-w-xl px-4 py-2 text-gray-700 bg-gray-100 rounded shadow">
                      <Link href={`/user/user?id=${user.id}`}>
                      <span className="block break-words font-bold">{user.username}</span>
                      </Link>
                      <span className="block break-words">{element.content}</span>
                    </div>
                  </li>
                )
              }
            })
        );
      }
    }
    
    const isAdmin = (id: number) => {
      for (let i = 0; i < channelAdmins.length; i++) {
        if (id == channelAdmins[i].id) {
          return true;
        }
      }
      return false;
    }

    const displayConnectedUsers = () => {
      if (connectedUser) {
        return (
           connectedUser.map((connected, index) => {
            if (user.id != connected.id)
            return (
              <li key={index}>
                <a className="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 cursor-pointer focus:outline-none">
                  <div className="w-full pb-2">
                    <div className="flex justify-between">
                      <span className="block ml-2 font-semibold text-gray-600">{connected.username}</span>
                      { (channelOwner && (channelOwner.user_id == user.id || channelOwner.user_id != connected.id && !isAdmin(connected.id))) ? (<button onClick={() => { muteUser(connected.id)}}>
                        <Image className="text-rgb" src="/mute.svg" width="20" height="20" alt="mute"/>
                      </button>) : undefined}
                      { (channelOwner && (channelOwner.user_id == user.id || channelOwner.user_id != connected.id && !isAdmin(connected.id))) ? (<button onClick={() => { kickUser(connected.id)}}>KICK</button>) : undefined}
                      { (channelOwner && (channelOwner.user_id == user.id || channelOwner.user_id != connected.id && !isAdmin(connected.id))) ? (<button onClick={() => { banUser(connected.id)}}>
                      <Image className="text-rgb" src="/ban.svg" width="20" height="20" alt="ban"/>
                      </button>) : undefined}
                      { (channelOwner && channelOwner.user_id == user.id && !isAdmin(connected.id)) ? (<button onClick={() => { promoteToAdmin(connected.id)}}>PROMOTE</button>) : undefined}
                    </div>
                  </div>
                </a>
              </li>
            )
          })
        )
      }
    }

    const displayBanList = () => {
      if (channelBanList) {
        return (
          channelBanList.map((banned, index) => {
            if (user.id != banned.id) {
              return (
                <li key={index}>
                  <a className="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 cursor-pointer focus:outline-none">
                    <div className="w-full pb-2">
                      <div className="flex justify-between">
                        <span className="block ml-2 font-semibold text-gray-600">{banned.username}</span>
                        <button onClick={() => { unbanUser(banned.id)}}>UNBAN</button>
                      </div>
                    </div>
                  </a>
                </li>
              )
            }
          })
        )
      }
    }

    const displayAdminList = () => {
      if (channelAdmins) {
        return (
          channelAdmins.map((admin, index) => {
            if (user.id != admin.id) {
              return (
                <li key={index}>
                  <a className="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 cursor-pointer focus:outline-none">
                    <div className="w-full pb-2">
                      <div className="flex justify-between">
                        <span className="block ml-2 font-semibold text-gray-600">{admin.username}</span>
                        <button onClick={() => { demoteToUser(admin.id)}}>DEMOTE</button>
                      </div>
                    </div>
                  </a>
                </li>
              )
            }
          })
        )
      }
    }

    const displayDashBoard = () => {
      const id: number = user.id;
      if (channelId && ((channelOwner && channelOwner.user_id == user.id) || (channelAdmins && isAdmin(user.id)))) {
        return (
          <div className="lg:col-span-3 color-4 border-t">
            <h2 className="my-2 mb-2 ml-2 text-lg color-4">Dashboard</h2>
            <div className="lg:grid lg:grid-cols-3">
              <div className="lg:col-span-1 color-4">
                <ul className="overflow-auto h-[20rem]">
                  <h2 className="my-2 mb-2 ml-2 text-lg color-4">Members</h2>
                  {
                    displayConnectedUsers()
                  }
                </ul>
              </div>
              <div className="lg:col-span-1 color-4">
                <ul className="overflow-auto h-[20rem]">
                  <h2 className="my-2 mb-2 ml-2 text-lg color-4"> Ban list</h2>
                  {
                    displayBanList()
                  }
                </ul>
              </div>
              {
                (channelOwner && channelOwner.user_id == user.id) ? (
                  <div className="lg:col-span-1 color-4">
                  <ul className="overflow-auto h-[20rem]">
                    <h2 className="my-2 mb-2 ml-2 text-lg color-4">Admin list</h2>
                    {
                      displayAdminList()
                    }
                  </ul>
                </div>
                ) : undefined
              }
          </div>
        </div>)
      }
    }

    const sendMessage = async () => {
      if (!socketRef.current) {
        return;
      }
      if (userId && !channelId){
        await socketRef.current.emit('private_message', {message: message, receiver: userId});
      } else if (!userId && channelId){
        await socketRef.current.emit('message', {message: message, channel: channelData});
      }
      handleReset();
      setMessage("");
    }

    const handleReset = () => {
      Array.from(document.querySelectorAll("input")).forEach(
        input => (input.value = "")
      );
    };

    const displayTop = () => {
      if (userId == 0 && channelId) {
        if (channelData) {
          return (
            <span className="block ml-2 text-xl font-bold text-gray-600">{channelData.channel_name}
              <button className="flex justify-end" onClick={leaveChannel}>Leave</button>
            </span>
            )
        }
        else {
          return (
            <span className="block ml-2 text-xl font-bold text-gray-600">Enter in a channel to chat</span>          
            )
        }
      }
      else if (userId && channelId == 0) {
        return (
          friends.map((element, index) => {
          if (element.id == userId) {
            return (
            <span key={index} className="block ml-2 text-xl font-bold text-gray-600">{element.username}</span>          
            )
          }
        })
        );
      }
      else {
        return(
          <span className="block ml-2 text-xl font-bold text-gray-600">Enter in a channel to chat</span>          
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
				router.push("/game");
				setNotifs([]);
				return ;
			}
		}
		socketRef.current.emit("inviteNotif", {id: invitedUser.id, sender: user});
		setWaiting(true);
		FriendWaitingFor.current = invitedUser;
	  }

	  const invitePlayButton = (friend) => {
		const online_color = {
			borderColor: "rgb(15, 150, 15)",
			backgroundColor:"rgb(51, 94, 114)"
		};
		const offline_color = {
			borderColor: "rgb(150, 0, 0)",
			backgroundColor: "rgb(91, 95, 97)"
		};
		const in_game_color = {
			borderColor: "rgb(200, 67, 0)",
			backgroundColor:"rgb(51, 94, 114)"
		}

		if (!loggedUsers.includes(friend.id)) {
			return (
				<button className="chat-play-btn cursor-default" title="Offline" style={offline_color}><Image className="text-rgb" src="/game.svg" width="30" height="30" alt="game"/></button>
			);
		}
		else if (inGameUsers.length > 0 && inGameUsers.includes(friend.id)) {
			return (
				<button className="chat-play-btn" title="In game" style={in_game_color} onClick={() => {/* spectate ici */}}><Image className="text-rgb" src="/game.svg" width="30" height="30" alt="game"/></button>
			);
		}
		else {
			return (
				<button className="chat-play-btn" title="Invite to play" style={online_color} onClick={() => {inviteInGame(friend)}}><Image className="text-rgb" src="/game.svg" width="30" height="30" alt="game"/></button>
			);
		}
	  }

    return (
      <>
	  	{
			waiting && (
	  		<WaitingFriend friendWaitingFor={FriendWaitingFor} setWaiting={setWaiting} socket={socketRef.current} user={user}/>
			)
		}
        <NavBar/>
          <div className="mx-auto py-8 form-chat">
            <div className="min-w-full border-color-5 rounded lg:grid lg:grid-cols-3 gap-3">
              <div className="lg:border-r lg:col-span-1 color-4 w- overflow-y-auto">
                <ul className="overflow-auto h-[20rem]">
                  <h2 className="my-2 mb-2 ml-2 text-lg color-4 items-center border-b font-bold text-gray-600">Group Chat</h2>
                {
                  publicChannels && publicChannels.map((channel, index) => {
                    return (
                      <li key={index}>
                        <a className="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none" onClick={() => {setChannelId(channel.id);}}>
                          <div className="w-full pb-2">
                            <div className="flex justify-between">
                              <span className="block ml-2 font-semibold text-gray-600">{channel.channel_name}</span>
                            </div>
                          </div>
                        </a>
                      </li>
                    )
                  })
                }
                {
                  protectedChannels && protectedChannels.map((channel, index) => {
                    return (
                      <li key={index}>
                        <a className="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none" onClick={() => {checkProtected(channel.id)}}>
                          <div className="w-full pb-2">
                            <div className="flex justify-between">
                              <span className="block ml-2 font-semibold text-gray-600">{channel.channel_name}</span>
                            </div>
                          </div>
                        </a>
                      </li>
                    )
                  })              
                }
                {
                  privateChannels && privateChannels.map((channel, index) => {
                    return (
                      <li key={index}>
                        <a className="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none" onClick={() => {
                          setChannelId(channel.id);
                          }}>
                          <div className="w-full pb-2">
                            <div className="flex justify-between">
                              <span className="block ml-2 font-semibold text-gray-600">{channel.channel_name}</span>
                            </div>
                          </div>
                        </a>
                      </li>
                    )
                  })              
                }
                  <AddChannel renderMessage={renderChannelList} setRenderMessage={setRenderChannelList}/>
                </ul>
                <ul className="overflow-auto h-[20rem]">
                <h2 className="my-2 mb-2 ml-2 text-lg color-4 border-b font-bold text-gray-600">Friends</h2>
                {
                  friends && friends.map((friend, index) => {
                    return (
                      <li key={index}>
                       <a className="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none" onClick={(event) => {
   							 if (!event.target.closest('button')) {
       							 setUserId(friend.id);
   							 }
							}}>
   						 <div className="w-full pb-2">
       					 	<div className="flex justify-between">
         				 		<span className="block ml-2 font-semibold text-gray-600">{friend.username}</span>
								{invitePlayButton(friend)}	
        				 	</div>
   						 </div>
					</a>

                      </li>
                    )
                  })
                }
                </ul> 
              </div>
              {/* Top of the chat */}
              <div className="lg:col-span-2 color-4">
                <div className="w-full">
                  <div className="relative flex items-center p-3 border-b border-gray-300">
                  {
                    displayTop()
                  }
                  </div>
                  {/* MESSAGE */}
                  <div className="relative w-full p-6 overflow-y-auto h-[32rem]">
                    <ul className="space-y-2">
                    {
                      displayMessage()
                    }
                    {
                      displaySocketMessage()
                    }
                    </ul>
                  </div>
                  <div className="flex items-center justify-between w-full p-3 border-t border-gray-300">
                    {
                      channelOwner && ((user.id == channelOwner.user_id) ? (<Owner channel_id={channelId}/>) : undefined)
                    }
                    <input type="text" placeholder="Message"
                      className="block w-full py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700"
                      name="message" required onChange={e => setMessage(e.target.value)} onKeyDown={(e) => {
                        if(e.key === 'Enter')
                        {
                          sendMessage();
                        }
                        }}/>
                    <button type="submit" onClick={() => {sendMessage()}}>
                      <svg id="SendButton" className="w-5 h-5 text-gray-500 origin-center transform rotate-90" xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
               {
                displayDashBoard()
               }
            </div>
          </div>

          <Footer/>
		  {
			notifs.length > 0 && (
	    	<Notifs senders={notifs} setNotifs={setNotifs} socket={socketRef.current} user={user}/>
			)
	 	}
        </>
        );
  };
  
  export const getServerSideProps = authenticatedWrapper(
    async (context: GetServerSidePropsContext) => {
      const Auth = getAuth(context);
      const user = await httpClient.get(`${process.env.NEXT_PUBLIC_ME_ROUTE}`, {
        headers: {
          Cookie: `Auth=${Auth}`,
        },
      });
      const friends = await httpClient.get("http://backend_app:3001/relationnal/getFriends", {
        headers: {
          Cookie: `Auth=${Auth}`,
        },
      });
      return {
        props: {
          user: user.data,
          authToken: Auth,
          friends: friends.data,
        },
      };
    }
  );
  
  export default Chat;
