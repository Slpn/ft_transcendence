import { GetServerSidePropsContext } from "next";
import { useEffect, useState, SyntheticEvent, useRef } from 'react'
import { httpClient } from "../../utils/http-client";
import NavBar from "../../components/menu&footer/navBar";
import Footer from "../../components/menu&footer/footer";
import { authenticatedWrapper, getAuth } from "../../utils/auth/wrapper";
import { io } from "socket.io-client";
import { getCookie } from 'cookies-next'
import Head from "next/head";
import Image from 'next/image'
import Avatar from "../../components/avatar/Avatar";
import AvatarMini from "../../components/avatar/Avatarmini";
import Notifs from "../../components/notifications";

const friends = ({user, friends, invitations, waitingFriends}) => {
  
  const[search, setSearch] = useState("");
  const[data, setData] = useState();

  const[invitationList, setInvitationList] = useState(invitations);
  const[friendsList, setFriendsList] = useState(friends);

  const[refresh, setRefresh] = useState(true);
  const[refreshFriends, setRefreshFriends] = useState(true);
  
  const [notifs, setNotifs] = useState([]);
  const notifsRef = useRef(notifs);

  const socketRef = useRef();
  
  const style = {width:'30%', display:'flex', justifyContent:'center'};
  
  useEffect(() => {
	window.addEventListener('beforeunload', handleBeforeUnload);

    socketRef.current = io('http://localhost:3001/', { query: {
      authToken: getCookie('Auth'),
    }
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

  useEffect(() => {
    const fetchUser = async () => {
      const users = await httpClient.post("http://localhost:3001/user/searchUser", {username: search});
      setData(users.data.user);
    }
    if (search) {
      fetchUser();
    }
  }, [search]);

  useEffect(() => {
    const invitationList = async () => {
      const list = await httpClient.get("http://localhost:3001/invitation/listsInvite");
      setInvitationList(list.data.invitationsList);
    }
    invitationList();
  }, [refresh]);

  useEffect(() => {
    const friendsList = async () => {
      const list = await httpClient.get("http://localhost:3001/relationnal/getFriends");
      setFriendsList(list.data);
    }
    if (refreshFriends || !refreshFriends) {
      friendsList();
    }
  }, [refreshFriends]);

  const addFriend = async (id: number) => {
    var flag = 0;
    for (let i = 0; i < friends.length; i++) {
      if (friends[i].id == id) {
        flag = 1;
      }
    }
    if (flag){
      alert("already friend");
    }
    else {
      await httpClient.post(`${process.env.NEXT_PUBLIC_INVITEFRIEND_ROUTE}`, {id: id});
      handleReset();
      setSearch("");
    }
  }

  const acceptInvite = async (invitation_id: number) => {
    const invitation = await httpClient.post(`${process.env.NEXT_PUBLIC_ACCEPTINVITATION_ROUTE}`, {invitation_id: invitation_id});
    if (invitation.data.accepted == true) {
      const friendShip = await httpClient.post(`${process.env.NEXT_PUBLIC_CREATEFRIENDSHIP_ROUTE}`, {id1: invitation.data.invitation.sender, id2: invitation.data.invitation.invited});
      setRefresh(!refresh);
      if (friendShip.data.accepted == true) {
        setRefreshFriends(!refreshFriends)
      }
    }
  }

  const declineInvite = async (invitation_id: number) => {
    await httpClient.post(`${process.env.NEXT_PUBLIC_DECLINEINVITATION_ROUTE}`, {invitation_id: invitation_id});
    setRefresh(!refresh);
  }

  const deleteFriend = async (user_id: number) => {
    await httpClient.post("http://localhost:3001/relationnal/deleteFriendship", {id: user_id});
    setRefreshFriends(!refreshFriends);
  }
  
  const handleReset = () => {
    Array.from(document.querySelectorAll("input")).forEach(
      input => (input.value = "")
    );
  };

  return (
    <>
      <Head><title className="text-color-1">Friends</title></Head>
          <NavBar/>
          <div className="page">
            <div className="container mx-auto form-friend">
              <div className="min-w-full border-color-5 rounded lg:grid lg:grid-cols-2">
                <div className="lg:border-r lg:col-span-1 color-4">
                  <div className="m-4 items-center flex">
                    <h3 className="text-color-1 font-bold justify-start">
                      Friends
                    </h3>
                    <h3 className="justify-end ml-auto font-bold font-mono text-color-1">
                      Total friend {friendsList && friendsList.length}
                    </h3>
                  </div>
                  <div className="m-4 flex justify-center items-center flex-col">
                    <input className="outline-none rounded w-64" type="text" placeholder="Add a friend" onChange={e => setSearch(e.target.value)} />
                    <ul className="overflow-y-auto h-[10rem]">
                    {
                      data && search && data.map((suser, index) => {
                        if (user.id != suser.id)
                        {
                          return(
                            <li key={index} className="color-2 h-16 w-64 flex justify-center items-center rounded py-2">
                              <span className="m-4 flex justify-center items-center inline-block py-2 pl-4 mx-3 mt-4">
                              <AvatarMini id_user={suser.id}/>
                              <p className="ml-4">{suser.username}</p>
                                <button className="ml-2" onClick={() => {
                                  addFriend(suser.id)}}>
                                  <Image className="text-rgb" src="/add.svg" width="30" height="30" alt="add"/>
                                </button>
                              </span>
                            </li>
                        )
                      }
                      })
                    }
                    </ul>
                    <ul className="overflow-y-auto h-[30rem]">
                    {
                      friendsList && friendsList.map((fuser, index) =>
                      <div key={index} className="flex justify-center items-center">
						            <AvatarMini id_user={fuser.id}/>
                        <p className="ml-6" key={index}>{fuser.username}</p>
                        <button onClick={() => {deleteFriend(fuser.id)}}>
                          <Image className="text-rgb ml-6" src="/delete.svg" width="30" height="30" alt="delete"/>
                        </button>
                      </div>
                      )
                    }
                    </ul>
                  </div>  
                </div>
                <div id="invitation lg:col-span-2 lg:block flex flex-col items-center">
                  <div className="flex justify-center items-center text-color-1 font-bold">
                    Invitations
                  </div>
                  <div className="flex justify-center items-center overflow-y-auto h-[48rem]" style={{height:'20%', flexDirection:'column'}}>
                    {
                      invitationList && invitationList.map((invitations, index) => {
                        let wuser = waitingFriends[index];
                        return (
                          <div key={index} className="flex items-center" style={{height:'50px', flexDirection:'row', width:'50%', justifyContent:'center'}}>
                            <div className="" style={style}>
                              {wuser.username}
                            </div>
                            <div>
                              <button className="ml-2" onClick={() => {
                                acceptInvite(invitations.id);
                              }}>
                              <Image className="text-rgb" src="/accept.svg" width="30" height="30" alt="accept"/>
                              </button>
                              <button className="ml-2" onClick={() => {
                                declineInvite(invitations.id);
                              }}>
                                <Image className="text-rgb ml-2" src="/denie.svg" width="30" height="30" alt="denie"/>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
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

export const getFriends = async (auth: string) => {
  const friends = await httpClient.get(`${process.env.NEXT_PUBLIC_GETFRIENDS_ROUTE}`, {
      headers: {
        Cookie: `Auth=${auth}`,
      },
    });
  return friends.data;
}

export const getServerSideProps = authenticatedWrapper(
  async (context: GetServerSidePropsContext) => {
    const Auth = getAuth(context);
    const user = await httpClient.get(`${process.env.NEXT_PUBLIC_ME_ROUTE}`, {
      headers: {
        Cookie: `Auth=${Auth}`,
      },
    });
    const friends = await httpClient.get(`${process.env.NEXT_PUBLIC_GETFRIENDS_ROUTE}`, {
      headers: {
        Cookie: `Auth=${Auth}`,
      },
    });
    const invitations = await httpClient.get(`${process.env.NEXT_PUBLIC_LISTSINVITE_ROUTE}`, {
      headers: {
        Cookie: `Auth=${Auth}`,
      },
    });
    return {
      props: {
        user: user.data,
        friends: friends.data,
        invitations: invitations.data.invitationsList,
        waitingFriends: invitations.data.users,
      },
    };
  }
);

export default friends;
