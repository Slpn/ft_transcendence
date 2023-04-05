import Link from "next/link";
import React, { SyntheticEvent, useEffect, useRef, useState } from 'react';
import NavBar from "../../components/menu&footer/navBar";
import Footer from "../../components/menu&footer/footer";
import { authenticatedWrapper, getAuth } from "../../utils/auth/wrapper";
import { GetServerSidePropsContext } from "next";
import { httpClient } from "../../utils/http-client";
import Head from "next/head";
import UploadButton from "../../components/avatar/UploadButton";
import Avatar from "../../components/avatar/Avatar";
import { getCookie } from "cookies-next";
import { io } from "socket.io-client";
import DeleteUploadButton from "../../components/avatar/DeleteUploadButton";
import Notifs from "../../components/notifications";

let body = {}

const settings = ({ user }) => {

  const [notifs, setNotifs] = useState([]);
  const notifsRef = useRef(notifs);
      
  const socketRef = useRef();

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
  
  const [username, setUsername] = useState("");
  const [email, setEmail ] = useState("");
  const [active, setActive] = useState(user.twoFactorAuthEnabled);
  const saveSetting = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!username && !email) {
      alert("No change...");
			return;
    }
    else {
      if (username) {
        body["username"] = username;
      }
      if (email) {
        body["email"] = email;
      }
      alert("Change saved !");
      httpClient.post("http://localhost:3001/user/saveSettings", body);
      body = {};
    }
  }

  const twoFactorSwitch = async (e: SyntheticEvent) => {
    const user = httpClient.post("http://localhost:3001/user/twoFactorSwitch", {});
    setActive(!active);
    if (active == false) {
      return;
    }
    e.preventDefault();
  }

  return (
  <>
  <Head><title>Settings</title></Head>
  <NavBar/>
  <div className="mx-auto py-8 form-settings">
  <div className="min-w-full border-color-5 rounded lg:grid lg:grid-col-2 gap-2">
				<div className="lg:col-span-1 color-4">
        <div className="flex justify-center items-center mb-10 flex-col">
          <Avatar id_user={user.id}/>
            <UploadButton/>
            {/* <DeleteUploadButton/> */}
        </div>
        <div className="w1/2">
          <div className="flex justify-center items-center">
            {user && <input className="py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700" type="text" placeholder={user.username} onChange={e => setUsername(e.target.value)}/>}
          </div>
          <br></br>
          <div className="flex justify-center items-center">
            {user && <input className="py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700" type="email" placeholder={user.email} onChange={e => setEmail(e.target.value)}/>}
          </div>
          <div className="m-5 flex justify-center items-center">
          <button className="width-90 border btn-save" type="submit" onClick={saveSetting}>Save</button>
          </div>
        </div>
        <div className="m-16  flex justify-center items-center">
          <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.55556 4H5C4.44771 4 4 4.44772 4 5V7.55556M16.4444 4H19C19.5523 4 20 4.44772 20 5V7.55556M20 16.4444V19C20 19.5523 19.5523 20 19 20H16.4444M7.55556 20H5C4.44771 20 4 19.5523 4 19V16.4444M5.77778 12.8889H6.66667M8.44444 12.8889H9.33333M5.77778 11H10.1111C10.6634 11 11.1111 10.5523 11.1111 10V5.77778M12.8889 5.77778V11.1111M16.4444 11H18.2222M14.6667 11H15.1111M13.7778 12.8889H15.1111M17 12.8889H18.2222M18.2222 15H15.5556M15.5556 16.8889V18.2222M13.7778 15V18.2222M12 18.2222V12.8889H11.1111M10.2222 14.6667V18.2222M18.2222 17.7778V17.7778C18.2222 17.5323 18.0232 17.3333 17.7778 17.3333V17.3333C17.5323 17.3333 17.3333 17.5323 17.3333 17.7778V17.7778C17.3333 18.0232 17.5323 18.2222 17.7778 18.2222V18.2222C18.0232 18.2222 18.2222 18.0232 18.2222 17.7778ZM18.2222 6.77778V8.33333C18.2222 8.88562 17.7745 9.33333 17.2222 9.33333H15.6667C15.1144 9.33333 14.6667 8.88562 14.6667 8.33333V6.77778C14.6667 6.22549 15.1144 5.77778 15.6667 5.77778H17.2222C17.7745 5.77778 18.2222 6.22549 18.2222 6.77778ZM6.77778 9.33333H8.33333C8.88562 9.33333 9.33333 8.88562 9.33333 8.33333V6.77778C9.33333 6.22549 8.88562 5.77778 8.33333 5.77778H6.77778C6.22549 5.77778 5.77778 6.22549 5.77778 6.77778V8.33333C5.77778 8.88562 6.22549 9.33333 6.77778 9.33333ZM7.44444 18.2222H6.77778C6.22549 18.2222 5.77778 17.7745 5.77778 17.2222V15.6667C5.77778 15.1144 6.22549 14.6667 6.77778 14.6667H7.44444C7.99673 14.6667 8.44444 15.1144 8.44444 15.6667V17.2222C8.44444 17.7745 7.99673 18.2222 7.44444 18.2222Z" stroke="#464455" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <button  className={`py-2 px-12 rounded-lg ${active ? "bg-blue-500" : "bg-red-500"} text-center text-white`} onClick={twoFactorSwitch} >
            {active ? "Actif" :"Inactif"}
          </button>
        </div>
        <div className="home-text m-16 flex justify-center items-center">
          <Link href={"/user/me"}>Click here to go to your profile</Link>
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
    return {
      props: {
        user: user.data,
      },
    };
  }
);

export default settings;
