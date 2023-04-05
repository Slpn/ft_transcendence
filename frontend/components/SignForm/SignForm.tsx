import React, { useState } from 'react';
import { useRouter } from "next/router";
import axios from 'axios';
import SignInForm from './SignInForm';
import SignUpForm from './signUpForm';
import Image from 'next/image'

function SignForm()
{

    const [state, setState] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");


	const body = {
		username: username,
		password: password
	}

	const signin = async (e: SyntheticEvent) => {
		e.preventDefault();
        const url = `${process.env.NEXT_PUBLIC_SIGNIN_ROUTE}`;
        axios.defaults.withCredentials = true;
		await axios.post(url, body);
	}
    return (
        <div className="index-home">
            <a className="btn-connexion" href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-a300ad3ee5c321619b54bfd056ea5ddfc357d1ef0af3a423165103cbdec19840&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fauth%2Fsignin42&response_type=code">
                <Image className="text-rgb" src="/42_Logo.svg" width="45" height="45" alt="42"/>
            </a>
            {/* <div className="index-home">
                {(!state) ? <SignUpForm/> : <SignInForm/>}
                <button className="btn-connexion" id="switchButton" onClick={() => setState(!state) }>{(state == false) ? "Or Sign In" : "Or Sign Up"}</button>
            </div> */}
        </div>
    )
}

export default SignForm;
