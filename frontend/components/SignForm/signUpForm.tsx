import React, { SyntheticEvent, useState } from 'react';
import axios from 'axios';

function SignUpForm()
{
    const [username, setUsername] = useState("");
    const [email, setEmail ] = useState("");
    const [password, setPassword] = useState("");


	const body = {
		login: username,
		username: username,
		email: email,
		password: password
	}

	const url  = `${process.env.NEXT_PUBLIC_SIGNUP_ROUTE}`; 
	const signup = async (e: SyntheticEvent) => {
		e.preventDefault();
		if (!username || !email || !password) {
			alert("Missing field..");
			return;
		}
		else {
			const ret = await axios.post(url, body);
			alert(ret.data.message);
		}
	}

    return (
        <div>
			<div className='index-home'>
				<input className="sign-form rounded outline-none" id="username" placeholder="Username"onChange={e => setUsername(e.target.value)}/>
				<input className="sign-form rounded outline-none" id="email" placeholder="Email"onChange={e => setEmail(e.target.value)}/>
				<input className="sign-form rounded outline-none" type="password" id="password" placeholder="Password"onChange={e => setPassword(e.target.value)}/>
				<button className="sign-form btn-connexion rounded" type="submit" id="signButton" onClick={signup}>Sign Up</button>
			</div>
		</div>
    )
}

export default SignUpForm;
