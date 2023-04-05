import React, { SyntheticEvent, useState } from 'react';
import { useRouter } from "next/router";
import axios, { AxiosError } from 'axios';


function SignInForm()
{
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

	const body = {
		username: username,
		password: password
	}

	const signin = async (e: SyntheticEvent) => {
		e.preventDefault();
        const url = `${process.env.NEXT_PUBLIC_SIGNIN_ROUTE}`;
        axios.defaults.withCredentials = true;
        const ret = await axios.post(url, body);
        if (ret.data.state == "failure") {
            alert(ret.data.message);
        }
        else if (ret.data.state == "success") {
            router.push("/user/2faSignin?loginchallenge=" + ret.data.loginChallenge);
        }
        else {
            router.push("/user/settings");
        }
	}

    
    return (
        <div>
            <input id="username"  placeholder="Username" onChange={e => setUsername(e.target.value)}/>
            <input id="password"  placeholder="Password" onChange={e => setPassword(e.target.value)}/>
            <button type="submit" onClick={signin}>Sign In</button>
        </div>
    )
}

export default SignInForm;
