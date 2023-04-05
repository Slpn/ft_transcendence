import { motion } from "framer-motion"
import Link from "next/link";

const Notifs = (props) => {

	const acceptInvitation = (nuser) => {
		props.socket.emit("gameInvitAccepted", {sender: nuser});
		props.setNotifs(props.senders.filter(sender => sender != nuser));
		props.socket.emit("launchGameWithFriend", {player1: nuser, player2: props.user});
	}

	const declineInvitation = (nuser) => {
		props.setNotifs(props.senders.filter(sender => sender != nuser));
		props.socket.emit("gameInvitationDeclined", {waitingPlayer: nuser});
	}

	
	return (
		<div className="notif-tab">
		{
		props.senders.map((nuser, index) => <>
		<div key={index} className="notif">
			<div className="text-sm">
				<span className="font-bold">{nuser.username}</span> wants to play
			</div>
			<div>
			{
				window.location.href == "http://localhost:3000/game" ? 
				<button key={index} className="notif-btn-left" onClick={() => { acceptInvitation(nuser) }}>accept</button> :
				<Link href="http://localhost:3000/game"><button key={index} className="notif-btn-left" onClick={() => { acceptInvitation(nuser) }}>accept</button></Link>
			}
			<button key={index} className="notif-btn-right" onClick={() => {declineInvitation(nuser)}}>decline</button>
			</div>
		</div>
		</>)}
		</div>
	)
}

export default Notifs;