import Image from 'next/image'

const WaitingFriend = (props) => {

	const cancelButton = () => {
		if (props.friendWaitingFor.current) {
			props.socket.emit('cancelNotif', {id: props.friendWaitingFor.current.id, sender: props.user});
			props.friendWaitingFor.current = null;
			if (props.setMatchState)
				props.setMatchState("cancel");
			if (props.setWaiting)
				props.setWaiting(false);
		}
		else if (props.hardcore) {
			props.setHardcore(false);
			props.socket.emit('matchmakingHardcore', {id: props.user.id});
		}
		else if (props.hardcoreRef.current) {
			// props.harcoreRef.current = false;
			props.socket.emit('matchmakingHardcore', {id: props.user.id});
		}
		else {
			props.socket.emit('matchmaking', {id: props.user.id});
		}
	}

	return (<>
		<div className="waiting-friend-chat">
			<div>Waiting&nbsp; <span className="font-bold">{props.friendWaitingFor.current ? props.friendWaitingFor.current.username : "player"}</span></div>
			<Image className="animate-spin text-rgb font-size" src="/waiting.svg" width="200" height="200" alt="add"/>
			<button className="chat-cancel-btn" onClick={() => {cancelButton()}}>Cancel</button>
		</div>
	</>)
}

export default WaitingFriend