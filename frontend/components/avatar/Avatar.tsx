import { httpClient } from "../../utils/http-client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import profile from '../../public/images/profile.png';

interface AvatarProps {
	id_user:number;
}

const Avatar = ({id_user}:AvatarProps) => {
  const [data, setData] = useState(null);
  const [id, setId] = useState(null);
  const [avatar42, setAvatar42] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
	// 
  httpClient.get('http://localhost:3001/user/getUserById/' + id_user)
    .then((response) => {
      setData(response.data);
      setId(response.data.id);
      setAvatar42(response.data.avatar42);
      setAvatar(response.data.avatar);
    })
    .catch((error) => {
      setError(error);
    })
  }, [id]);

  if (error) {
    console.error('Error getting user data', error);
    return <img className="avatar" src={avatar42} alt="Avatar" />;
  }

  if (avatar) {
	let url:string;
    url = `${process.env.NEXT_PUBLIC_UPLOAD_ROUTE}/${avatar}`;
	return <img className="avatar" src={url} alt="Avatar" />
  } else if (avatar42) {
    return <img className="avatar" src={avatar42} alt="Avatar" />;
  }
  else {
	return <Image className="avatar" src={profile} alt="default"/>
  }

  ;
};

export default Avatar;
