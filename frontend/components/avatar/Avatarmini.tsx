import { httpClient } from "../../utils/http-client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import profile from '../../public/images/profile.png';

interface AvatarProps {
	id_user:number;
}

const AvatarMini = ({id_user}:AvatarProps) => {
  const [data, setData] = useState(null);
  const [id, setId] = useState(null);
  const [username, setUsername] = useState(null);
  const [avatar42, setAvatar42] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    httpClient.get('http://localhost:3001/user/getUserById/' +id_user)
      .then((response) => {
        setData(response.data);
        setId(response.data.id);
		setUsername(response.data.username);
        setAvatar42(response.data.avatar42);
        setAvatar(response.data.avatar);
      })
      .catch((error) => {
        setError(error);
      })
  }, [id]);

  if (error) {
    console.error('Error getting user data', error);
    return <img className="avatarmini" src={avatar42} alt={username} />;
  }

  if (avatar) {
	let url:string;
    url = `${process.env.NEXT_PUBLIC_UPLOAD_ROUTE}/${avatar}`;
	return <img className="avatarmini" src={url} alt={username} />
  } 
  else if (avatar42) {
    return <img className="avatarmini" src={avatar42} alt={username} />;
  }
  else 
  {
	  return <Image className="avatarmini" src={profile} alt="default"/>
  }

  ;
};

export default AvatarMini;
