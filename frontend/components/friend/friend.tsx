import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { httpClient } from "../../utils/http-client";
import { authenticatedWrapper, getAuth } from "../../utils/auth/wrapper";
import { useState, useEffect} from 'react'
import React, { SyntheticEvent } from 'react';
import Invitation  from "./invitation"

type FriendProps = {
  user: {
    id: number;
    username: string,
    email: string;
  };
};

const Friend = ({user}: FriendProps) => { 
  const [data, setData] = useState(null);
  const [id, setId] = useState(null);
  const [username, setUsername] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [addFriend, setaddFriend] = useState(null);
  useEffect(() => {
    httpClient.get("http://localhost:3001/user/me")
    .then((response) => {
        setData(response.data)
        setId(response.data.id)
        setUsername(response.data.username)
      })
  }, [])

  return (
    <>
    <div className="flex flex-col justify-center fixed">
      <a className="text-white">
        <span className="fixed" onClick={() => setIsOpen(!isOpen)}>
        <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.5 18H18.7687C19.2035 18 19.4209 18 19.5817 17.9473C20.1489 17.7612 20.5308 17.1231 20.498 16.4163C20.4887 16.216 20.42 15.9676 20.2825 15.4708C20.168 15.0574 20.1108 14.8507 20.0324 14.6767C19.761 14.0746 19.2766 13.6542 18.7165 13.5346C18.5546 13.5 18.3737 13.5 18.0118 13.5L15.5 13.5346M14.6899 11.6996C15.0858 11.892 15.5303 12 16 12C17.6569 12 19 10.6569 19 9C19 7.34315 17.6569 6 16 6C15.7295 6 15.4674 6.0358 15.2181 6.10291M13.5 8C13.5 10.2091 11.7091 12 9.5 12C7.29086 12 5.5 10.2091 5.5 8C5.5 5.79086 7.29086 4 9.5 4C11.7091 4 13.5 5.79086 13.5 8ZM6.81765 14H12.1824C12.6649 14 12.9061 14 13.1219 14.0461C13.8688 14.2056 14.5147 14.7661 14.8765 15.569C14.9811 15.8009 15.0574 16.0765 15.21 16.6278C15.3933 17.2901 15.485 17.6213 15.4974 17.8884C15.5411 18.8308 15.0318 19.6817 14.2756 19.9297C14.0613 20 13.7714 20 13.1916 20H5.80844C5.22864 20 4.93875 20 4.72441 19.9297C3.96818 19.6817 3.45888 18.8308 3.50261 17.8884C3.51501 17.6213 3.60668 17.2901 3.79003 16.6278C3.94262 16.0765 4.01891 15.8009 4.12346 15.569C4.4853 14.7661 5.13116 14.2056 5.87806 14.0461C6.09387 14 6.33513 14 6.81765 14Z" stroke="#464455" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        </span>
      </a>
      { isOpen && (
        <>
        <div className="form-div2">
          <ul>
            <li>{username}</li>
            <Invitation/>
          </ul>
        </div>
        </>
        )
      }
    </div>
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

export default Friend;
