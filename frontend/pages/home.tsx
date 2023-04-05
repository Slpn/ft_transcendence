import React, { useEffect, useRef, useState } from 'react';
import NavBar from "../components/menu&footer/navBar";
import Footer from "../components/menu&footer/footer";
import { authenticatedWrapper, getAuth } from "../utils/auth/wrapper";
import { GetServerSidePropsContext } from "next";
import { httpClient } from "../utils/http-client";
import Head from "next/head";
import PlayButton from "../components/game/playButton";
import StatsPlayer from "../components/user/statsPlayer";
import ProgressBar from "../components/user/progressBar";
import GameRules from "../components/game/gameRules";
import GameHistory from "../components/game/gameHistory";
import { motion } from "framer-motion"
import { io } from "socket.io-client";
import { getCookie } from 'cookies-next'
import Notifs from "../components/notifications";
import Achievements from "../components/utils/Achievements_me";

/* CSS site
  SVG
  https://www.svgrepo.com/collection/asoka-interface-icons/2
  Theme color
  https://coolors.co/2b4162-385f71-97a8b4-f5f0f6-e6d2b7-d7b377-8f754f
  (1) 43, 65, 98
  (2) 56, 95, 113
  (3) 245, 240, 246
  (4) 215, 179, 119
  (5) 143, 117, 79
  (6) 151, 168, 180
  (7) 230, 210, 183
*/

type UserProps = {
    user: {
      id: number;
      username: string,
      email: string;
	    avatar: string;
    };
  };

  const body = {}
  
  const home = ({ user } : UserProps) => {
    
	const [notifs, setNotifs] = useState([]);

    const socketRef = useRef();
	const notifsRef = useRef(notifs);


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


    return (
      <>
      <Head><title>Home</title></Head>
        <NavBar/>
        <div className="overflow-y-auto ">
          <div className="container mx-auto py-8 form-game ">
            <div className="min-w-full justify-center items-center">
            <div className="light text-center text-7m mt-8" data-text="TRANSCENDENCE">
              TRANSCENDENCE
            </div>
          <div className="min-w-full flex justify-center items-center">
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 3}}>
              <div className="">
                <div className="home-page">
                  <div className="items-center flex lg:grid lg:grid-col-2">
                    <div className="items-center flex lg:grid lg:grid-cols-2">
                      <div className="home-form">
                        <StatsPlayer/>
                      </div>
                      <div>
                        <h3 className="font-bold text-color-3 lg:ml-12">
                          Let's improve your stat !
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="items-center flex lg:grid lg:grid-cols-2">
                    <div>
                      <h3 className="font-bold text-color-3">
                        Complete these achievements !
                      </h3>
                    </div>
                    <div className="home-form">
                      <Achievements/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="">
                <div className="home-page">
                  <div className="items-center flex lg:grid lg:grid-col-2">
                    <div className="items-center flex lg:grid lg:grid-cols-2">
                      <div className="home-form">
                        <GameHistory/>
                      </div>
                      <div>
                        <h3 className="font-bold text-color-3 lg:ml-12">
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="items-center flex lg:grid lg:grid-cols-2">
                    <div>
                    </div>
                    <div className="ml-12">
                      <PlayButton/>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
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
  
  export default home;

